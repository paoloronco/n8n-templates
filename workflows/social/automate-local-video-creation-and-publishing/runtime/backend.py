"""Durable local-video queue, approvals and provider receipts. OAuth stays in n8n."""
import base64
import datetime as dt
import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import sqlite3
import subprocess
import sys
import time
from contextlib import contextmanager
from zoneinfo import ZoneInfo

VERSION = "2.0.1"
CONFIG = Path(os.environ.get("LOCAL_VIDEO_CONFIG", Path(__file__).with_name("config.local.json")))
ID = re.compile(r"[a-f0-9]{32}")
HASH = re.compile(r"[a-f0-9]{64}")
MAX_VIDEO = 40 * 1024 * 1024


def require(ok, message):
    if not ok:
        raise ValueError(message)


def encoded(value):
    return base64.urlsafe_b64encode(json.dumps(value, separators=(",", ":")).encode()).decode().rstrip("=")


def decode(value):
    require(isinstance(value, str) and len(value) <= 24000 and re.fullmatch(r"[A-Za-z0-9_+/=-]*", value), "Invalid encoded input")
    return json.loads(base64.urlsafe_b64decode(value + "==="))


def config():
    c = json.loads(CONFIG.read_text(encoding="utf-8-sig"))
    require(len(c.get("secret", "")) >= 32, "Configure a worker signing secret of at least 32 characters")
    require(Path(c["stateDir"]).is_absolute(), "stateDir must be absolute")
    ZoneInfo(c.get("timezone", "Europe/Rome"))
    return c


def stamp():
    return dt.datetime.now(dt.timezone.utc).isoformat()


@contextmanager
def database(c):
    root = Path(c["stateDir"])
    root.mkdir(mode=0o700, parents=True, exist_ok=True)
    d = sqlite3.connect(root / "runtime.sqlite3", timeout=30, isolation_level=None)
    d.row_factory = sqlite3.Row
    d.executescript("""
    PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,created REAL,data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS nonces(nonce TEXT PRIMARY KEY,created REAL NOT NULL);
    CREATE TABLE IF NOT EXISTS slots(slot TEXT PRIMARY KEY,id TEXT NOT NULL,started REAL NOT NULL);
    CREATE TABLE IF NOT EXISTS events(seq INTEGER PRIMARY KEY,at TEXT,id TEXT,event TEXT,data TEXT);
    CREATE TABLE IF NOT EXISTS health(key TEXT PRIMARY KEY,data TEXT);
    """)
    d.execute("BEGIN IMMEDIATE")
    try:
        yield d
        d.commit()
    except BaseException:
        d.rollback()
        raise
    finally:
        d.close()


def event(d, j, name, **details):
    d.execute("INSERT INTO events(at,id,event,data) VALUES(?,?,?,?)", (stamp(), j.get("id"), name, json.dumps(details)))


def load(d, identity):
    require(isinstance(identity, str) and ID.fullmatch(identity), "Invalid job ID")
    row = d.execute("SELECT data FROM jobs WHERE id=?", (identity,)).fetchone()
    require(row is not None, "Unknown job")
    return json.loads(row[0])


def save(d, j):
    j["updatedAt"] = stamp()
    d.execute("UPDATE jobs SET data=? WHERE id=?", (json.dumps(j), j["id"]))
    return j


def rows(d):
    return [json.loads(r[0]) for r in d.execute("SELECT data FROM jobs ORDER BY created")]


def public(j):
    value = {k: v for k, v in j.items() if k not in ("lease", "uploadNonce", "action", "executionId", "leaseUntil")}
    if j.get("approval") and all(j[k]["state"] in ("published", "skipped") for k in ("instagram", "youtube")):
        value["state"] = "published"
    elif j.get("approval") and any(j[k]["state"] in ("failed", "reconciliation_required") for k in ("instagram", "youtube")):
        value["state"] = "recovery_required"
    return value


def text(value, name, limit):
    require(isinstance(value, str) and 1 <= len(value.strip()) <= limit and not re.search(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", value), "Invalid " + name)
    return value.strip()


def valid_request(v):
    require(isinstance(v, dict), "Expected a brief object")
    fmt = v.get("format", "wall_text")
    require(fmt in ("wall_text", "slideshow", "hook_demo", "custom_motion"), "Unsupported format")
    b = v.get("brief", {})
    require(isinstance(b, dict), "A real content brief is required")
    title = text(b.get("title"), "title", 100)
    narration = text(b.get("narration"), "narration", 1600)
    caption = text(b.get("caption", title), "caption", 2200)
    scenes = b.get("scenes")
    require(isinstance(scenes, list) and 2 <= len(scenes) <= 5, "Supply two to five scenes")
    clean_scenes = []
    for s in scenes:
        require(isinstance(s, dict), "Invalid scene")
        item = {"title": text(s.get("title"), "scene title", 70), "body": text(s.get("body"), "scene body", 160)}
        if s.get("asset"):
            require(re.fullmatch(r"[a-f0-9]{64}\.(?:png|jpg|jpeg|webp)", s["asset"]), "Only locally uploaded image assets are supported")
            item["asset"] = s["asset"]
        clean_scenes.append(item)
    if fmt == "slideshow":
        require(all(s.get("asset") for s in clean_scenes), "Every slideshow scene needs an uploaded image")
    channels = v.get("channels", ["instagram", "youtube"])
    require(isinstance(channels, list) and channels and len(set(channels)) == len(channels) and set(channels) <= {"instagram", "youtube"}, "Choose Instagram and/or YouTube")
    private = v.get("privateTest") is True
    require(not private or channels == ["youtube"], "Private tests must target YouTube alone; Instagram has no private publishing test")
    accent = b.get("accent", "#73e6b1")
    require(re.fullmatch(r"#[a-fA-F0-9]{6}", accent), "Invalid accent color")
    require(b.get("language", "en-US") in ("it-IT", "en-US", "en-GB"), "Supported narration languages: it-IT, en-US, en-GB")
    return {"format": fmt, "scenario": v.get("scenario", "creator"), "localCopy": True,
            "brief": {"title": title, "narration": narration, "caption": caption, "scenes": clean_scenes,
                      "brand": text(b.get("brand", "Local Video"), "brand", 40), "accent": accent,
                      "language": b.get("language", "en-US")}, "channels": channels, "privateTest": private}


def enqueue(d, v):
    request = valid_request(v)
    key = text(v.get("idempotencyKey"), "idempotency key", 120)
    require(re.fullmatch(r"[A-Za-z0-9:_-]+", key), "Invalid idempotency key")
    identity = hashlib.sha256(key.encode()).hexdigest()[:32]
    old = d.execute("SELECT data FROM jobs WHERE id=?", (identity,)).fetchone()
    if old:
        j = json.loads(old[0])
        require(j["request"] == request, "Idempotency key reused with different content")
        return public(j)
    require(d.execute("SELECT count(*) FROM jobs WHERE created>?", (time.time() - 86400,)).fetchone()[0] < 20, "Twenty render requests per rolling day are allowed")
    j = {"id": identity, "createdAt": stamp(), "state": "queued", "request": request, "published": False,
         "instagram": {"state": "pending" if "instagram" in request["channels"] else "skipped"},
         "youtube": {"state": "pending" if "youtube" in request["channels"] else "skipped"}, "approval": None}
    d.execute("INSERT INTO jobs VALUES(?,?,?)", (identity, time.time(), json.dumps(j)))
    event(d, j, "brief_created")
    return public(j)


def authenticate(d, c, e, purpose=""):
    require(isinstance(e, dict), "Expected a signed envelope")
    ts, nonce, payload, sig = (e.get(k, "") for k in ("timestamp", "nonce", "payload", "signature"))
    require(isinstance(ts, str) and re.fullmatch(r"\d{13}", ts) and abs(time.time() * 1000 - int(ts)) <= 60000, "Expired request")
    require(isinstance(nonce, str) and re.fullmatch(r"[a-f0-9]{24}", nonce), "Invalid nonce")
    require(isinstance(payload, str) and len(payload) <= 22000, "Payload too large")
    expected = hmac.new(c["secret"].encode(), (purpose + ts + "\n" + nonce + "\n" + payload).encode(), hashlib.sha256).hexdigest()
    require(isinstance(sig, str) and hmac.compare_digest(expected, sig), "Invalid signature")
    d.execute("DELETE FROM nonces WHERE created<?", (time.time() - 120,))
    require(not d.execute("SELECT 1 FROM nonces WHERE nonce=?", (nonce,)).fetchone(), "Replayed request")
    d.execute("INSERT INTO nonces VALUES(?,?)", (nonce, time.time()))
    return decode(payload), nonce


def bridge(d, c, e):
    v, _ = authenticate(d, c, e)
    action = v.get("action")
    if action == "create":
        return {"ok": True, "job": enqueue(d, v)}
    if action in ("list", "heartbeat"):
        for j in rows(d):
            p = j["youtube"]
            if p["state"] in ("uploading", "processing") and time.time() - p.get("updated", 0) > 900:
                p.update(state="failed" if p.get("videoId") else "reconciliation_required", error="Interrupted YouTube execution; resume its recorded ID or reconcile the existing upload")
                save(d, j)
        if action == "heartbeat":
            d.execute("INSERT OR REPLACE INTO health VALUES('worker',?)", (json.dumps({"at": stamp(), "busy": v.get("busy") is True}),))
        return {"ok": True, "jobs": [public(j) for j in rows(d)[-100:]]}
    if action == "pull":
        candidates = [j for j in rows(d) if j["state"] == "queued" or (j["state"] == "rendering" and j.get("leaseUntil", 0) < time.time())]
        if not candidates:
            return {"ok": True, "job": None}
        j = candidates[0]
        j.update(state="rendering", lease=secrets.token_hex(16), leaseUntil=time.time() + 1800)
        save(d, j)
        event(d, j, "render_claimed")
        return {"ok": True, "job": j}
    j = load(d, v.get("id"))
    if action in ("renew", "complete"):
        require(j.get("lease") and hmac.compare_digest(j["lease"], str(v.get("lease", ""))), "Invalid render lease")
        if action == "renew":
            j["leaseUntil"] = time.time() + 1800
        else:
            result = v.get("result", {})
            require(result.get("state") in ("ready", "failed"), "Invalid render completion")
            if result["state"] == "ready":
                require(j.get("sha256") and j.get("qc", {}).get("fullDecode"), "Upload verified bytes before completing the render")
            j["state"] = result["state"]
            j["result"] = {k: result[k] for k in ("state", "preview", "qc", "error", "id", "copySource") if k in result}
            j.pop("lease", None)
            j.pop("leaseUntil", None)
            event(d, j, "render_" + j["state"])
        save(d, j)
        return {"ok": True, "job": public(j)}
    if action == "review":
        require(j["state"] == "ready" and j.get("sha256") == v.get("sha256"), "Review must match the ready MP4 hash")
        require(not any(j[k]["state"] in ("uploading", "processing", "published") for k in ("instagram", "youtube")), "A claimed or published draft cannot change approval")
        require(v.get("decision") in ("approve", "reject"), "Choose approve or reject")
        if v["decision"] == "approve":
            at = v.get("publishAt") or stamp()
            due = dt.datetime.fromisoformat(at.replace("Z", "+00:00"))
            require(due.tzinfo is not None, "Publication time must include a timezone")
            j["approval"] = {"sha256": j["sha256"], "briefSha256": brief_hash(j), "at": stamp(), "publishAt": due.isoformat(),
                             "by": text(v.get("reviewer"), "reviewer", 80), "targets": targets(c, j)}
        else:
            j["approval"] = None
            j["state"] = "rejected"
        event(d, j, "draft_" + v["decision"], sha256=j["sha256"])
        save(d, j)
        return {"ok": True, "job": public(j)}
    if action == "retry":
        channel = v.get("channel")
        require(channel in ("render", "instagram", "youtube"), "Choose the failed stage")
        if channel == "render":
            require(j["state"] == "failed" and not j.get("approval"), "Only failed, unapproved rendering may be retried")
            j["state"] = "queued"
        else:
            p = j[channel]
            require(p["state"] in ("failed", "reconciliation_required"), "Stage does not need recovery")
            if channel == "youtube":
                require(p.get("videoId"), "Uncertain upload: enter the verified existing YouTube video ID through reconcile; do not upload again")
                p["state"] = "pending"
            elif p.get("stage") == "publish":
                p.update(state="pending", stage="recover_publish")
            else:
                require(p.get("stage") not in ("create",), "Uncertain container creation requires operator reconciliation")
                p["state"] = "pending"
            p.pop("executionId", None)
        event(d, j, "retry_requested", channel=channel)
        save(d, j)
        return {"ok": True, "job": public(j)}
    if action == "reconcile":
        channel = v.get("channel")
        require(channel in ("youtube", "instagram"), "Invalid reconciliation channel")
        p = j[channel]
        require(p["state"] == "reconciliation_required", "Only an uncertain outcome can be reconciled")
        identity = v.get("remoteId", "")
        require(re.fullmatch(r"[A-Za-z0-9_-]{11}", identity) if channel == "youtube" else re.fullmatch(r"\d{5,30}", identity), "Invalid remote ID")
        field = "videoId" if channel == "youtube" else "mediaId"
        require(not p.get(field) or p[field] == identity, "A recorded provider ID is immutable")
        p.update({field: identity, "state": "pending", "stage": "verify"})
        p.pop("executionId", None)
        event(d, j, "reconciliation_id_recorded", channel=channel, remoteId=identity)
        save(d, j)
        return {"ok": True, "job": public(j)}
    raise ValueError("Unsupported worker action")


def brief_hash(j):
    return hashlib.sha256(json.dumps(j["request"], sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def targets(c, j):
    return {"instagram": c.get("accountId") if "instagram" in j["request"]["channels"] else None,
            "youtube": c.get("channelId") if "youtube" in j["request"]["channels"] else None,
            "youtubeVisibility": "private" if j["request"]["privateTest"] else "public"}


def approved(c, j):
    a = j.get("approval") or {}
    return a.get("sha256") == j.get("sha256") and bool(j.get("sha256")) and a.get("briefSha256") == brief_hash(j) and a.get("targets") == targets(c, j)


def verify_media(path, c):
    def run(args):
        p = subprocess.run(args, capture_output=True, text=True, timeout=300)
        require(p.returncode == 0, "Media validation failed: " + p.stderr[-400:])
        return p
    p = json.loads(run([c.get("ffprobe", "ffprobe"), "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)]).stdout)
    video = next((s for s in p["streams"] if s.get("codec_type") == "video"), {})
    audio = next((s for s in p["streams"] if s.get("codec_type") == "audio"), {})
    duration = float(p["format"].get("duration", 0))
    require(video.get("codec_name") == "h264" and video.get("width") == 1080 and video.get("height") == 1920 and 3 <= duration <= 60, "Expected a 1080x1920 H.264 video between 3 and 60 seconds")
    require(audio.get("codec_name") == "aac", "AAC narration is required")
    r = run([c.get("ffmpeg", "ffmpeg"), "-hide_banner", "-nostats", "-v", "info", "-xerror", "-i", str(path), "-af", "volumedetect", "-f", "null", "-"])
    mean = re.search(r"mean_volume:\s*(-?[\d.]+|-?inf) dB", r.stderr)
    peak = re.search(r"max_volume:\s*(-?[\d.]+|-?inf) dB", r.stderr)
    require(mean and peak and float(mean[1]) > -55 and float(peak[1]) > -45, "Audio is silent or too quiet")
    return {"width": 1080, "height": 1920, "duration": duration, "fullDecode": True, "audioAudible": True,
            "meanDb": float(mean[1]), "peakDb": float(peak[1])}


def media_path(c, identity):
    require(ID.fullmatch(str(identity)), "Invalid media ID")
    root = Path(c["stateDir"]).resolve()
    path = root / "media" / identity / "reel.mp4"
    require(path.resolve() == path and not path.is_symlink(), "Unsafe media path")
    return path


def prepared(c, j):
    require(approved(c, j), "The current file and targets must be approved")
    path = media_path(c, j["id"])
    require(path.is_file() and hashlib.sha256(path.read_bytes()).hexdigest() == j["sha256"], "Approved MP4 is missing or changed")
    return {"jobId": j["id"], "id": j["id"], "kind": "reel", "path": str(path), "title": j["request"]["brief"]["title"],
            "description": j["request"]["brief"]["caption"] + "\n\n#Shorts\nLocal video source: " + j["id"],
            "channelId": c.get("channelId"), "privateTest": j["request"]["privateTest"], "dryRun": False,
            "sha256": j["sha256"], "sourceFileSha256": j["sha256"], "media": j["qc"], "approved": True}


def receipt(c, j, done=True):
    p = j["instagram"]
    result = {"id": j["id"], "state": "published" if p["state"] == "published" else "instagram_" + p["state"],
              "done": done, "action": p.get("action"), "approved": approved(c, j), "targets": {k: k in j["request"]["channels"] for k in ("instagram", "youtube")},
              "instagram": {k: v for k, v in p.items() if k != "action"}, "youtube": j["youtube"]}
    if "youtube" in j["request"]["channels"] and approved(c, j):
        result["youtubePrepared"] = prepared(c, j)
    return result


def offer(c, j, stage, method, node, edge="", query=None, delay=1):
    p = j["instagram"]
    p.update(stage=stage, state="processing", action={"stepId": secrets.token_hex(16), "method": method, "node": str(node),
                                                  "edge": edge, "query": query or {}, "delaySeconds": delay})
    return receipt(c, j, False)


def media_url(c, j):
    require(re.fullmatch(r"https://[A-Za-z0-9.-]+/webhook/[A-Za-z0-9_-]+", c.get("mediaBase", "")), "Configure the HTTPS media webhook")
    expires = int(time.time()) + 7200
    sig = hmac.new(c["secret"].encode(), f'local-video-media:v1:{j["id"]}:{expires}'.encode(), hashlib.sha256).hexdigest()
    return f'{c["mediaBase"]}?id={j["id"]}&expires={expires}&sig={sig}'


def claim(d, c, v):
    if v.get("dryRun") is True:
        return {"ok": True, "done": True, "state": "preflight", "enabled": c.get("enabled", False)}
    if not c.get("enabled"):
        return {"done": True, "state": "disabled"}
    execution = text(str(v.get("executionId", "")), "execution owner", 120)
    now = dt.datetime.now(ZoneInfo(c.get("timezone", "Europe/Rome")))
    manual = v.get("manual") is True
    if not manual and (now.hour not in c.get("hours", [10, 12, 15, 18, 21]) or now.minute > 20):
        return {"done": True, "state": "outside_slot"}
    candidates = []
    for j in rows(d):
        if j["state"] != "ready" or not approved(c, j):
            continue
        if dt.datetime.fromisoformat(j["approval"]["publishAt"]).timestamp() > time.time():
            continue
        ig, yt = j["instagram"], j["youtube"]
        if ig["state"] == "processing" and ig.get("executionId") != execution:
            if time.time() - ig.get("updated", 0) < 900:
                continue
            if ig.get("stage") == "create":
                ig.update(state="reconciliation_required", error="Container creation outcome is uncertain")
                save(d, j)
                continue
            if ig.get("stage") == "publish":
                ig["stage"] = "recover_publish"
            ig["state"] = "pending"
        if ig["state"] in ("pending", "processing") or (ig["state"] in ("published", "skipped", "failed", "reconciliation_required") and yt["state"] == "pending"):
            candidates.append(j)
    if not candidates:
        return {"done": True, "state": "waiting_for_approved_video"}
    j = candidates[0]
    slot = ("manual:" + execution) if manual else now.strftime("%Y-%m-%d-%H")
    old = d.execute("SELECT id FROM slots WHERE slot=?", (slot,)).fetchone()
    if old and old[0] != j["id"]:
        return {"done": True, "state": "slot_already_claimed"}
    d.execute("INSERT OR IGNORE INTO slots VALUES(?,?,?)", (slot, j["id"], time.time()))
    p = j["instagram"]
    p.update(executionId=execution, updated=time.time())
    if p["state"] not in ("pending", "processing"):
        # A YouTube recovery reuses the recorded Instagram result and exact approved MP4.
        save(d, j)
        return receipt(c, j)
    stage = p.get("stage", "identity")
    if stage == "recover_publish":
        result = offer(c, j, stage, "GET", p["containerId"], query={"fields": "status_code,status"})
    elif stage == "verify":
        result = offer(c, j, stage, "GET", p["mediaId"], query={"fields": "id,permalink,caption,timestamp,media_product_type"})
    elif p.get("action") and p["action"]["method"] == "GET":
        a = p["action"]
        result = offer(c, j, stage, "GET", a["node"], a["edge"], a["query"], a["delaySeconds"])
    else:
        result = offer(c, j, "identity", "GET", "me", "assigned_instagram_accounts", {"fields": "id,username"})
    save(d, j)
    return result


def record_instagram(d, c, v):
    j = load(d, v.get("id"))
    require(approved(c, j), "Approval is missing or changed")
    p = j["instagram"]
    a = p.get("action", {})
    require(a.get("stepId") == v.get("stepId") and p.get("executionId") == str(v.get("executionId")), "Publication step owner mismatch")
    r = v.get("response", {})
    require(isinstance(r, dict), "Invalid Meta response")
    stage = p["stage"]
    p["updated"] = time.time()
    if r.get("error"):
        if stage == "publish":
            result = offer(c, j, "recover_publish", "GET", p["containerId"], query={"fields": "status_code,status"})
        else:
            p.update(state="reconciliation_required" if a["method"] == "POST" else "failed", error=r["error"], action=None)
            result = receipt(c, j)
    elif stage == "identity":
        require(r.get("data") == [{"id": c.get("accountId"), "username": c.get("username")}], "Instagram identity does not match approved target")
        result = offer(c, j, "quota", "GET", c["accountId"], "content_publishing_limit")
    elif stage == "quota":
        q = (r.get("data") or [{}])[0]
        require(isinstance(q.get("quota_usage"), int) and q["quota_usage"] < q.get("config", {}).get("quota_total", 50), "Instagram quota unavailable or exhausted")
        result = offer(c, j, "create", "POST", c["accountId"], "media", {"media_type": "REELS", "video_url": media_url(c, j), "caption": j["request"]["brief"]["caption"], "share_to_feed": True})
    elif stage == "create":
        require(re.fullmatch(r"\d{5,30}", str(r.get("id", ""))), "Invalid container ID")
        p.update(containerId=str(r["id"]), polls=0)
        result = offer(c, j, "poll", "GET", p["containerId"], query={"fields": "status_code,status"}, delay=30)
    elif stage in ("poll", "recover_publish"):
        p["polls"] = p.get("polls", 0) + 1
        status = r.get("status_code")
        if stage == "poll" and status == "FINISHED":
            p["publishStarted"] = time.time()
            result = offer(c, j, "publish", "POST", c["accountId"], "media_publish", {"creation_id": p["containerId"]})
        elif stage == "recover_publish" and status == "PUBLISHED":
            result = offer(c, j, "recover_media", "GET", c["accountId"], "media", {"fields": "id,caption,permalink,timestamp,media_product_type", "limit": 25})
        elif status == "IN_PROGRESS" and p["polls"] < 20:
            result = offer(c, j, stage, "GET", p["containerId"], query={"fields": "status_code,status"}, delay=30)
        else:
            p.update(state="reconciliation_required", error="Inspect existing container; processing or publication is uncertain", action=None)
            result = receipt(c, j)
    elif stage == "publish":
        require(re.fullmatch(r"\d{5,30}", str(r.get("id", ""))), "Invalid Instagram media ID")
        p["mediaId"] = str(r["id"])
        result = offer(c, j, "verify", "GET", p["mediaId"], query={"fields": "id,permalink,caption,timestamp,media_product_type"})
    elif stage == "recover_media":
        matches = [m for m in r.get("data", []) if m.get("caption") == j["request"]["brief"]["caption"] and abs(dt.datetime.fromisoformat(m.get("timestamp", "").replace("Z", "+00:00")).timestamp() - p.get("publishStarted", 0)) < 900]
        require(len(matches) == 1, "No unique Instagram publication match; keep reconciliation blocked")
        p["mediaId"] = str(matches[0]["id"])
        result = offer(c, j, "verify", "GET", p["mediaId"], query={"fields": "id,permalink,caption,timestamp,media_product_type"})
    elif stage == "verify":
        require(str(r.get("id")) == p.get("mediaId") and r.get("caption") == j["request"]["brief"]["caption"] and r.get("media_product_type") == "REELS" and re.fullmatch(r"https://(?:www\.)?instagram\.com/(?:reel|p)/[A-Za-z0-9_-]+/?", r.get("permalink", "")), "Instagram read-back mismatch")
        p.update(state="published", permalink=r["permalink"], publishedAt=stamp(), action=None)
        p.pop("error", None)
        j["published"] = all(j[k]["state"] in ("published", "skipped") for k in ("instagram", "youtube"))
        event(d, j, "instagram_published", mediaId=p["mediaId"])
        result = receipt(c, j)
    else:
        raise ValueError("Unknown Instagram stage")
    save(d, j)
    return result


def youtube(d, c, action, v):
    j = load(d, v.get("jobId", v.get("id")))
    require(approved(c, j) and "youtube" in j["request"]["channels"], "YouTube target must be approved")
    p = j["youtube"]
    source = prepared(c, j)
    if action == "claim-prepared":
        require(c.get("enabled"), "Publishing disabled")
        require(v.get("sha256") == source["sha256"] and v.get("channelId") == c.get("channelId"), "YouTube preparation mismatch")
        if v.get("dryRun") is True:
            return {**source, "action": "dry_run", "dryRun": True}
        execution = str(v.get("executionId", ""))
        require(execution, "Execution owner required")
        if p.get("videoId"):
            p.update(executionId=execution, state="processing", updated=time.time())
            save(d, j)
            return {**source, "action": "verify", "videoId": p["videoId"]}
        require(p["state"] == "pending", "An upload was already claimed. Reconcile its existing video ID before retrying")
        p.update(state="uploading", executionId=execution, updated=time.time())
        event(d, j, "youtube_upload_claimed")
        save(d, j)
        return {**source, "action": "upload"}
    if action == "record":
        identity = v.get("videoId", "")
        require(p.get("executionId") == str(v.get("executionId")), "YouTube upload owner mismatch")
        if not isinstance(identity, str) or not re.fullmatch(r"[A-Za-z0-9_-]{11}", identity):
            p.update(state="reconciliation_required", error="YouTube returned no valid video ID. Reconcile the existing upload before retrying")
            save(d, j)
            event(d, j, "youtube_upload_uncertain")
            return {**source, "ok": False, "error": p["error"]}
        require(p["state"] in ("uploading", "processing") and (not p.get("videoId") or p["videoId"] == identity), "YouTube upload ID is immutable")
        p.update(videoId=identity, state="processing", updated=time.time())
        event(d, j, "youtube_id_saved", videoId=identity)
        save(d, j)
        return {**source, "videoId": identity}
    if action == "finalize":
        require(p.get("executionId") == str(v.get("executionId")), "YouTube verification owner mismatch")
        require(v.get("videoId") == p.get("videoId") and v.get("channelId") == c.get("channelId") and v.get("processed") is True and v.get("youtubeAudioVerified") is True, "YouTube processing has not been verified")
        expected = "private" if j["request"]["privateTest"] else "public"
        require(v.get("privacyStatus") == expected, "YouTube visibility does not match approval")
        p.update(state="published", privacyStatus=expected, publishedAt=stamp(), permalink="https://www.youtube.com/watch?v=" + p["videoId"])
        p.pop("error", None)
        event(d, j, "youtube_published", videoId=p["videoId"], visibility=expected)
        j["published"] = all(j[k]["state"] in ("published", "skipped") for k in ("instagram", "youtube"))
        save(d, j)
        return {"ok": True, "id": j["id"], "published": j["published"], "instagram": j["instagram"], "youtube": p}
    if action == "failure":
        require(p.get("executionId") == str(v.get("executionId")), "YouTube recovery owner mismatch")
        p.update(state="failed" if p.get("videoId") else "reconciliation_required", error=str(v.get("verificationError", "YouTube verification failed"))[:500])
        save(d, j)
        event(d, j, "youtube_recovery_required", videoId=p.get("videoId"))
        return {"ok": True, "id": j["id"], "recoveryRequired": True, "youtube": p, "instagram": j["instagram"]}
    raise ValueError("Unsupported YouTube operation")


def dispatch(family, action, v):
    c = config()
    with database(c) as d:
        if family == "queue":
            if action == "enqueue":
                return enqueue(d, v)
            if action == "status":
                return public(load(d, v))
            if action == "bridge":
                return bridge(d, c, v)
        if family == "youtube":
            return claim(d, c, v) if action == "local-claim" else youtube(d, c, action, v)
        if family == "production" and action == "configure":
            require(isinstance(v.get("enabled"), bool) and set(v) == {"enabled"}, "Supply only a boolean enabled flag")
            c["enabled"] = v["enabled"]
            temporary = CONFIG.with_suffix(".tmp")
            temporary.write_text(json.dumps(c, indent=2))
            temporary.chmod(0o600)
            os.replace(temporary, CONFIG)
            event(d, {}, "publishing_gate_changed", enabled=c["enabled"])
            return {"ok": True, "enabled": c["enabled"]}
        if action == "status":
            jobs = rows(d)
            counts = {s: sum(j["state"] == s for j in jobs) for s in {j["state"] for j in jobs}}
            worker = d.execute("SELECT data FROM health WHERE key='worker'").fetchone()
            return {"ok": True, "runtimeVersion": VERSION, "enabled": c.get("enabled", False), "accountId": c.get("accountId"), "username": c.get("username"), "channelId": c.get("channelId"), "timezone": c.get("timezone", "Europe/Rome"), "hours": c.get("hours", [10, 12, 15, 18, 21]), "counts": counts, "awaitingApproval": sum(j["state"] == "ready" and not approved(c, j) for j in jobs), "worker": json.loads(worker[0]) if worker else None, "freeGiB": round(shutil.disk_usage(c["stateDir"]).free / 1024**3, 2)}
        if action == "batch":
            ready = [j["id"] for j in rows(d) if j["state"] == "ready" and approved(c, j)][:5]
            return {"ok": True, "queued": 0, "approvedReady": ready, "note": "Briefs enter through the local intake form; this schedule does not invent content or approve drafts"}
        if action == "record":
            return record_instagram(d, c, v)
        if action == "authorize-upload":
            r, nonce = authenticate(d, c, v, "local-video-upload:v1\n")
            j = load(d, r.get("id"))
            require(j["state"] == "rendering" and j.get("lease") and hmac.compare_digest(j["lease"], str(r.get("lease", ""))) and j.get("leaseUntil", 0) > time.time(), "Upload render lease mismatch")
            require(isinstance(r.get("size"), int) and 1024 <= r["size"] <= MAX_VIDEO and HASH.fullmatch(str(r.get("sha256", ""))), "Invalid MP4 size or hash")
            j.update(uploadNonce=nonce, expectedSize=r["size"], expectedHash=r["sha256"])
            save(d, j)
            (Path(c["stateDir"]) / "uploads").mkdir(mode=0o700, exist_ok=True)
            return {"ok": True, "id": j["id"], "nonce": nonce, "fileName": j["id"] + "-" + nonce + ".part"}
        if action == "finish-upload":
            j = load(d, v.get("id"))
            require(j["state"] == "rendering" and j.get("uploadNonce") == v.get("nonce"), "Upload authorization mismatch")
            path = Path(c["stateDir"]) / "uploads" / (j["id"] + "-" + j["uploadNonce"] + ".part")
            require(not path.is_symlink() and path.stat().st_size == j["expectedSize"] and hashlib.sha256(path.read_bytes()).hexdigest() == j["expectedHash"], "Uploaded MP4 bytes do not match authorization")
            qc = verify_media(path, c)
            target = media_path(c, j["id"])
            target.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
            os.replace(path, target)
            j.update(sha256=j["expectedHash"], qc=qc, approval=None)
            save(d, j)
            event(d, j, "mp4_verified", sha256=j["sha256"])
            return {"ok": True, "id": j["id"], "state": "awaiting_review", "sha256": j["sha256"], "qc": qc}
        if action == "media":
            j = load(d, v.get("id"))
            expires = str(v.get("expires", ""))
            require(re.fullmatch(r"\d{10}", expires) and time.time() <= int(expires) <= time.time() + 7200, "Expired media link")
            sig = hmac.new(c["secret"].encode(), f'local-video-media:v1:{j["id"]}:{expires}'.encode(), hashlib.sha256).hexdigest()
            require(hmac.compare_digest(sig, str(v.get("sig", ""))) and approved(c, j), "Media link not authorized")
            return {"ok": True, "path": str(media_path(c, j["id"]))}
        raise ValueError("Unsupported runtime operation")


def cli(family):
    try:
        action = sys.argv[1]
        v = ({"id": sys.argv[2], "nonce": sys.argv[3]} if action == "finish-upload" else sys.argv[2] if family == "queue" and action == "status" else decode(sys.argv[2])) if len(sys.argv) > 2 else {}
        print(json.dumps(dispatch(family, action, v)))
    except Exception as error:
        print(json.dumps({"ok": False, "error": str(error)[:500]}))
        sys.exit(1)

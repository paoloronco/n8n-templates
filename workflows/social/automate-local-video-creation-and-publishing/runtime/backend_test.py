import copy
import hashlib
import hmac
import json
from pathlib import Path
import secrets
import tempfile
import time
import unittest
from unittest.mock import patch

import backend as b


def brief(key="test-one", channels=None):
    return {"idempotencyKey": key, "format": "wall_text", "channels": channels or ["instagram", "youtube"],
            "brief": {"title": "A concrete demonstration", "narration": "Create a draft. Review the actual video before publication.",
                      "scenes": [{"title": "Create", "body": "Supply a real brief."}, {"title": "Review", "body": "Approve the exact finished video."}]}}


class RuntimeTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.old = b.CONFIG
        b.CONFIG = self.root / "config.local.json"
        self.c = {"secret": "test-secret-" * 5, "stateDir": str(self.root / "state"), "enabled": True,
                  "accountId": "123456789", "username": "test_account", "channelId": "UC-test-channel", "timezone": "Europe/Rome",
                  "mediaBase": "https://example.test/webhook/video-media"}
        b.CONFIG.write_text(json.dumps(self.c))

    def tearDown(self):
        b.CONFIG = self.old
        self.temp.cleanup()

    def call(self, family, action, value=None):
        return b.dispatch(family, action, {} if value is None else value)

    def envelope(self, value, purpose=""):
        e = {"timestamp": str(int(time.time() * 1000)), "nonce": secrets.token_hex(12), "payload": b.encoded(value)}
        e["signature"] = hmac.new(self.c["secret"].encode(), (purpose + e["timestamp"] + "\n" + e["nonce"] + "\n" + e["payload"]).encode(), hashlib.sha256).hexdigest()
        return e

    def worker(self, value):
        return self.call("queue", "bridge", self.envelope(value))

    def ready(self, channels=None):
        j = self.call("queue", "enqueue", brief(channels=channels))
        job = self.worker({"action": "pull"})["job"]
        data = b"synthetic media fixture" * 80
        digest = hashlib.sha256(data).hexdigest()
        e = self.envelope({"id": j["id"], "lease": job["lease"], "size": len(data), "sha256": digest}, "local-video-upload:v1\n")
        auth = self.call("production", "authorize-upload", e)
        (Path(self.c["stateDir"]) / "uploads" / auth["fileName"]).write_bytes(data)
        qc = {"width": 1080, "height": 1920, "duration": 12, "fullDecode": True, "audioAudible": True}
        with patch.object(b, "verify_media", return_value=qc):
            self.call("production", "finish-upload", auth)
        self.worker({"action": "complete", "id": j["id"], "lease": job["lease"], "result": {"state": "ready", "qc": qc}})
        return self.call("queue", "status", j["id"])

    def approve(self, j):
        return self.worker({"action": "review", "id": j["id"], "sha256": j["sha256"], "decision": "approve", "reviewer": "test operator"})["job"]

    def test_same_key_returns_same_job(self):
        v = brief()
        self.assertEqual(self.call("queue", "enqueue", v)["id"], self.call("queue", "enqueue", v)["id"])
        v["brief"]["title"] = "Different"
        with self.assertRaisesRegex(ValueError, "different content"):
            self.call("queue", "enqueue", v)

    def test_missing_content_is_rejected(self):
        with self.assertRaises(ValueError):
            self.call("queue", "enqueue", {"format": "wall_text", "idempotencyKey": "x"})

    def test_private_instagram_test_is_rejected(self):
        v = brief(); v["privateTest"] = True
        with self.assertRaisesRegex(ValueError, "YouTube alone"):
            self.call("queue", "enqueue", v)

    def test_slideshow_requires_real_assets(self):
        v = brief(); v["format"] = "slideshow"
        with self.assertRaisesRegex(ValueError, "uploaded image"):
            self.call("queue", "enqueue", v)

    def test_invalid_signature_and_expiry(self):
        e = self.envelope({"action": "list"}); e["signature"] = "0" * 64
        with self.assertRaisesRegex(ValueError, "signature"):
            self.call("queue", "bridge", e)
        e = self.envelope({"action": "list"}); e["timestamp"] = "1000000000000"
        with self.assertRaisesRegex(ValueError, "Expired"):
            self.call("queue", "bridge", e)

    def test_replay_is_rejected(self):
        e = self.envelope({"action": "list"})
        self.call("queue", "bridge", e)
        with self.assertRaisesRegex(ValueError, "Replayed"):
            self.call("queue", "bridge", e)

    def test_upload_signature_cannot_be_used_as_worker_signature(self):
        e = self.envelope({"action": "list"}, "local-video-upload:v1\n")
        with self.assertRaisesRegex(ValueError, "signature"):
            self.call("queue", "bridge", e)

    def test_lease_renewal_does_not_claim_another_job(self):
        j = self.call("queue", "enqueue", brief())
        a = self.worker({"action": "pull"})["job"]
        self.assertIsNone(self.worker({"action": "pull"})["job"])
        self.assertTrue(self.worker({"action": "renew", "id": j["id"], "lease": a["lease"]})["ok"])

    def test_upload_without_matching_lease_fails(self):
        j = self.call("queue", "enqueue", brief())
        e = self.envelope({"id": j["id"], "lease": "bad", "size": 2000, "sha256": "a" * 64}, "local-video-upload:v1\n")
        with self.assertRaisesRegex(ValueError, "lease"):
            self.call("production", "authorize-upload", e)

    def test_complete_before_verified_upload_fails(self):
        self.call("queue", "enqueue", brief())
        j = self.worker({"action": "pull"})["job"]
        with self.assertRaisesRegex(ValueError, "Upload verified"):
            self.worker({"action": "complete", "id": j["id"], "lease": j["lease"], "result": {"state": "ready"}})

    def test_ready_does_not_mean_approved(self):
        j = self.ready()
        self.assertIsNone(j["approval"])
        r = self.call("youtube", "local-claim", {"executionId": "exec-1", "manual": True})
        self.assertEqual(r["state"], "waiting_for_approved_video")

    def test_approval_is_bound_to_exact_bytes(self):
        j = self.ready()
        with self.assertRaisesRegex(ValueError, "hash"):
            self.worker({"action": "review", "id": j["id"], "sha256": "b" * 64, "decision": "approve", "reviewer": "operator"})
        j = self.approve(j)
        self.assertEqual(j["approval"]["sha256"], j["sha256"])
        self.assertEqual(self.call("youtube", "local-claim", {"executionId": "exec-1", "manual": True})["action"]["method"], "GET")

    def test_changing_target_invalidates_approval(self):
        j = self.approve(self.ready())
        self.c["accountId"] = "987654321"; b.CONFIG.write_text(json.dumps(self.c))
        self.assertEqual(self.call("youtube", "local-claim", {"executionId": "exec-1", "manual": True})["state"], "waiting_for_approved_video")

    def test_rejection_never_enters_publication(self):
        j = self.ready()
        self.worker({"action": "review", "id": j["id"], "sha256": j["sha256"], "decision": "reject"})
        self.assertEqual(self.call("youtube", "local-claim", {"executionId": "exec-1", "manual": True})["state"], "waiting_for_approved_video")

    def test_youtube_only_skips_instagram_without_inventing_receipt(self):
        self.approve(self.ready(["youtube"]))
        r = self.call("youtube", "local-claim", {"executionId": "exec-1", "manual": True})
        self.assertTrue(r["done"])
        self.assertEqual(r["state"], "instagram_skipped")
        self.assertFalse(r["targets"]["instagram"])

    def test_youtube_claim_is_not_repeated(self):
        self.approve(self.ready(["youtube"]))
        r = self.call("youtube", "local-claim", {"executionId": "exec-1", "manual": True})
        v = {**r["youtubePrepared"], "executionId": "exec-1"}
        self.assertEqual(self.call("youtube", "claim-prepared", v)["action"], "upload")
        with self.assertRaisesRegex(ValueError, "already claimed"):
            self.call("youtube", "claim-prepared", v)

    def test_recorded_youtube_id_resumes_verification_only(self):
        j = self.approve(self.ready(["youtube"]))
        r = self.call("youtube", "local-claim", {"executionId": "exec-1", "manual": True})
        v = {**r["youtubePrepared"], "executionId": "exec-1"}
        self.call("youtube", "claim-prepared", v)
        self.call("youtube", "record", {**v, "videoId": "AbCdEf01234"})
        resumed = self.call("youtube", "claim-prepared", {**v, "executionId": "exec-2"})
        self.assertEqual(resumed["action"], "verify")
        self.assertEqual(resumed["videoId"], "AbCdEf01234")
        with self.assertRaisesRegex(ValueError, "immutable"):
            self.call("youtube", "record", {**v, "executionId": "exec-2", "videoId": "AbCdEf54321"})

    def test_wrong_youtube_visibility_cannot_finalize(self):
        self.approve(self.ready(["youtube"]))
        r = self.call("youtube", "local-claim", {"executionId": "exec-1", "manual": True})
        v = {**r["youtubePrepared"], "executionId": "exec-1"}
        self.call("youtube", "claim-prepared", v)
        self.call("youtube", "record", {**v, "videoId": "AbCdEf01234"})
        with self.assertRaisesRegex(ValueError, "visibility"):
            self.call("youtube", "finalize", {**v, "videoId": "AbCdEf01234", "processed": True, "youtubeAudioVerified": True, "privacyStatus": "private"})
        result = self.call("youtube", "finalize", {**v, "videoId": "AbCdEf01234", "processed": True, "youtubeAudioVerified": True, "privacyStatus": "public"})
        self.assertTrue(result["published"])

    def test_dry_run_does_not_claim_upload(self):
        self.approve(self.ready(["youtube"]))
        r = self.call("youtube", "local-claim", {"executionId": "exec-1", "manual": True})
        v = {**r["youtubePrepared"], "executionId": "exec-1", "dryRun": True}
        self.assertEqual(self.call("youtube", "claim-prepared", v)["action"], "dry_run")
        self.assertEqual(self.call("queue", "status", r["id"])["youtube"]["state"], "pending")

    def test_missing_upload_id_persists_uncertainty(self):
        self.approve(self.ready(["youtube"]))
        r = self.call("youtube", "local-claim", {"executionId": "exec-1", "manual": True})
        v = {**r["youtubePrepared"], "executionId": "exec-1"}
        self.call("youtube", "claim-prepared", v)
        result = self.call("youtube", "record", {**v, "videoId": None})
        self.assertFalse(result["ok"])
        self.assertEqual(self.call("queue", "status", r["id"])["youtube"]["state"], "reconciliation_required")
        with self.assertRaisesRegex(ValueError, "existing YouTube"):
            self.worker({"action": "retry", "id": r["id"], "channel": "youtube"})
        self.worker({"action": "reconcile", "id": r["id"], "channel": "youtube", "remoteId": "AbCdEf01234"})
        self.assertEqual(self.call("youtube", "claim-prepared", {**v, "executionId": "exec-2"})["action"], "verify")

    def test_verification_error_recovers_without_another_upload(self):
        self.approve(self.ready(["youtube"]))
        r = self.call("youtube", "local-claim", {"executionId": "exec-1", "manual": True})
        v = {**r["youtubePrepared"], "executionId": "exec-1"}
        self.call("youtube", "claim-prepared", v)
        self.call("youtube", "record", {**v, "videoId": "AbCdEf01234"})
        self.call("youtube", "failure", {**v, "verificationError": "synthetic processing timeout"})
        self.worker({"action": "retry", "id": r["id"], "channel": "youtube"})
        recovered=self.call("youtube", "local-claim", {"executionId": "exec-2", "manual": True})
        result=self.call("youtube", "claim-prepared", {**recovered["youtubePrepared"], "executionId": "exec-2"})
        self.assertEqual(result["action"], "verify")
        self.assertEqual(result["videoId"], "AbCdEf01234")
        self.assertEqual(self.call("queue", "status", r["id"])["state"], "ready")
        self.call("youtube", "finalize", {**result, "executionId": "exec-2", "processed": True, "youtubeAudioVerified": True, "privacyStatus": "public"})
        complete = self.call("queue", "status", r["id"])
        self.assertEqual(complete["state"], "published")
        self.assertNotIn("error", complete["youtube"])

    def test_lost_instagram_publish_response_is_reconciled_by_reads(self):
        j=self.approve(self.ready(["instagram"]))
        r=self.call("youtube", "local-claim", {"executionId": "exec-1", "manual": True})
        def record(response):
            nonlocal r
            r=self.call("production", "record", {"id":j["id"],"executionId":"exec-1","stepId":r["action"]["stepId"],"response":response})
        record({"data":[{"id":self.c["accountId"],"username":self.c["username"]}]})
        record({"data":[{"quota_usage":0,"config":{"quota_total":50}}]})
        self.assertEqual(r["action"]["method"],"POST")
        record({"id":"111111111"})
        record({"status_code":"FINISHED"})
        self.assertEqual(r["action"]["edge"],"media_publish")
        record({"error":{"message":"synthetic lost response"}})
        self.assertEqual(r["action"]["method"],"GET")
        record({"status_code":"PUBLISHED"})
        record({"data":[{"id":"222222222","caption":j["request"]["brief"]["caption"],"timestamp":b.stamp()}]})
        record({"id":"222222222","caption":j["request"]["brief"]["caption"],"media_product_type":"REELS","permalink":"https://www.instagram.com/reel/SyntheticTest/"})
        self.assertEqual(r["state"],"published")
        self.assertTrue(r["done"])
        self.assertTrue(self.call("queue", "status", j["id"])["published"])
        self.assertEqual(self.call("youtube", "local-claim", {"executionId":"exec-2","manual":True})["state"],"waiting_for_approved_video")

    def test_narration_language_fails_before_queueing(self):
        request = brief()
        request["brief"]["language"] = "xx-XX"
        with self.assertRaisesRegex(ValueError, "Supported narration"):
            self.call("queue", "enqueue", request)

    def test_publishing_gate_is_explicit_and_durable(self):
        self.assertFalse(self.call("production", "configure", {"enabled": False})["enabled"])
        self.assertFalse(self.call("production", "status", {})["enabled"])
        with self.assertRaisesRegex(ValueError, "boolean"):
            self.call("production", "configure", {"enabled": "yes"})
        self.assertTrue(self.call("production", "configure", {"enabled": True})["enabled"])


if __name__ == "__main__":
    unittest.main()

(() => {
  function qs(root, sel){ return root.querySelector(sel); }

  function normalizeText(s){
    return (s ?? "").toString().replace(/\s+/g, " ").trim();
  }

  function looksLikeJson(text, contentType){
    const ct = (contentType || "").toLowerCase();
    if (ct.includes("application/json")) return true;
    const s = (text || "").trim();
    return (s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"));
  }

  function tryParseJson(text){
    if (typeof text !== "string") return null;
    try { return JSON.parse(text); } catch { return null; }
  }

  function extractPayload(parsed){
    let root = parsed;
    if (Array.isArray(root)) root = root[0];
    if (root && root.structured && typeof root.structured === "object") root = root.structured;
    if (root && root.output && typeof root.output === "object") root = root.output;
    return root;
  }

  function clearBubble(bubble){
    bubble.textContent = "";
    bubble.innerHTML = "";
  }

  function renderSearchResults(bubble, data){
    clearBubble(bubble);
    const results = Array.isArray(data.results) ? data.results : [];

    if (results.length === 0){
      const none = document.createElement("div");
      none.className = "wpaicb-sr-follow";
      none.textContent = normalizeText(data.follow_up) || "No results found.";
      bubble.appendChild(none);
      return;
    }

    const ul = document.createElement("ul");
    ul.className = "wpaicb-sr-list";

    results.forEach(r => {
      const li = document.createElement("li");
      li.className = "wpaicb-sr-item";

      const title = normalizeText(r.title) || "Untitled";
      const url = normalizeText(r.url) || "#";

      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = title;
      li.appendChild(a);

      const summary = normalizeText(r.summary);
      if (summary){
        const sum = document.createElement("div");
        sum.className = "wpaicb-sr-summary";
        sum.textContent = summary;
        li.appendChild(sum);
      }
      ul.appendChild(li);
    });

    bubble.appendChild(ul);

    const fu = normalizeText(data.follow_up);
    if (fu){
      const follow = document.createElement("div");
      follow.className = "wpaicb-sr-follow";
      follow.textContent = fu;
      bubble.appendChild(follow);
    }
  }

  function renderInfo(bubble, data){
    clearBubble(bubble);
    const results = Array.isArray(data.results) ? data.results : [];
    const follow = normalizeText(data.follow_up);

    if (results.length){
      const wrap = document.createElement("div");
      results.forEach(item => {
        const block = document.createElement("div");
        block.style.marginBottom = "10px";

        if (typeof item === "string"){
          block.textContent = item;
        } else if (item && typeof item === "object"){
          const line = [];
          if (item.title) line.push(item.title);
          if (item.summary) line.push(item.summary);
          if (item.skill) line.push(`Skill: ${item.skill}`);
          if (item.category) line.push(`Category: ${item.category}`);
          if (item.proficiency) line.push(`Proficiency: ${item.proficiency}`);
          block.textContent = line.filter(Boolean).join(" — ");
        } else {
          block.textContent = normalizeText(item);
        }
        wrap.appendChild(block);
      });
      bubble.appendChild(wrap);
    }

    if (follow){
      const fu = document.createElement("div");
      fu.className = "wpaicb-sr-follow";
      fu.textContent = follow;
      bubble.appendChild(fu);
    }

    if (!results.length && !follow){
      bubble.textContent = "Ok—can you share a bit more context?";
    }
  }

  function isSmalltalkWrappedAsSearchResults(obj, siteHome){
    if (!obj || obj.type !== "search_results") return false;
    const q = (obj.query ?? "").toString();
    const results = Array.isArray(obj.results) ? obj.results : [];
    if (results.length !== 1) return false;

    const r0 = results[0] || {};
    const url = normalizeText(r0.url);
    const title = normalizeText(r0.title);
    const summary = normalizeText(r0.summary);

    const queryLooksEmpty = q === "" || q === "\u200B" || normalizeText(q) === "";
    const looksLikeHomepage =
      url === normalizeText(siteHome) ||
      url === normalizeText(siteHome).replace(/\/$/, "") ||
      url === normalizeText(siteHome) + "/";

    return queryLooksEmpty && looksLikeHomepage && !!title && !summary && !normalizeText(obj.follow_up);
  }

  function renderBestEffortFromUnknownJson(bubble, obj){
    const candidates = [
      obj?.text, obj?.message, obj?.reply, obj?.answer,
      obj?.output?.text, obj?.output?.follow_up, obj?.output?.query,
    ].map(normalizeText).filter(Boolean);

    if (candidates.length){
      bubble.textContent = candidates[0];
      return;
    }

    if (Array.isArray(obj) && obj.every(x => typeof x === "string")){
      bubble.textContent = obj.join("\n");
      return;
    }

    const keys = (obj && typeof obj === "object") ? Object.keys(obj).slice(0, 10) : [];
    bubble.textContent = keys.length
      ? `Unrecognized structured response. Fields: ${keys.join(", ")}`
      : "Unrecognized structured response.";
  }

  function renderBotReply(bubble, rawText, contentType, upstreamStatus){
    // upstreamStatus is the status code returned by n8n (wrapped by WP)
    const ok = upstreamStatus >= 200 && upstreamStatus < 300;

    if (!ok){
      if (upstreamStatus === 401 || upstreamStatus === 403){
        bubble.textContent = `(HTTP ${upstreamStatus}) Unauthorized. Check webhook header auth and CORS.`;
        return;
      }
      bubble.textContent = `(HTTP ${upstreamStatus}) ${rawText || "Webhook error"}`;
      return;
    }

    const ct = (contentType || "").toLowerCase();
    const text = rawText ?? "";

    if (ct.includes("text/html")){
      const tmp = document.createElement("div");
      tmp.innerHTML = text;
      bubble.textContent = tmp.textContent || tmp.innerText || "";
      return;
    }

    if (looksLikeJson(text, ct)){
      let parsed = (typeof text === "string") ? tryParseJson(text) : text;
      if (!parsed){
        bubble.textContent = text;
        return;
      }
      if (Array.isArray(parsed) && parsed.length > 0){
        parsed = parsed[0];
      }

      const payload = extractPayload(parsed);
      if (!payload || typeof payload !== "object"){
        bubble.textContent = normalizeText(payload) || "Empty response";
        return;
      }

      if (isSmalltalkWrappedAsSearchResults(payload, WPAICB.siteHome)){
        bubble.textContent = normalizeText(payload.results[0].title);
        return;
      }

      if (payload.type === "search_results"){
        renderSearchResults(bubble, payload);
        return;
      }
      if (payload.type === "info"){
        renderInfo(bubble, payload);
        return;
      }
      if (payload.type === "text"){
        bubble.textContent = normalizeText(payload.text);
        return;
      }

      renderBestEffortFromUnknownJson(bubble, payload);
      return;
    }

    bubble.textContent = text || `(HTTP ${upstreamStatus}) Empty response`;
  }

  function addRow(chat, role, cls){
    const row = document.createElement("div");
    row.className = `wpaicb-row ${cls}`;

    const roleEl = document.createElement("span");
    roleEl.className = "wpaicb-role";
    roleEl.textContent = role + ":";

    const bubble = document.createElement("span");
    bubble.className = "wpaicb-bubble";

    row.appendChild(roleEl);
    row.appendChild(bubble);

    chat.appendChild(row);
    chat.scrollTop = chat.scrollHeight;

    return { row, bubble };
  }

  function initWidget(root){
    // Validate WPAICB globals are set
    if (!window.WPAICB || !window.WPAICB.restUrl) {
      console.error('WPAICB: Configuration error', window.WPAICB);
      const chat = qs(root, ".wpaicb-chat");
      chat.innerHTML = '<div style="padding:10px; color:red;">❌ Configuration error: Chatbot not properly initialized. Check browser console and plugin settings.</div>';
      return;
    }

    // Validate REST URL format
    if (window.WPAICB.restUrl.includes('undefined')) {
      console.error('WPAICB: Invalid REST URL (contains "undefined")', window.WPAICB.restUrl);
      const chat = qs(root, ".wpaicb-chat");
      chat.innerHTML = '<div style="padding:10px; color:red;">❌ Configuration error: REST API URL malformed. Admin please check plugin setup.</div>';
      return;
    }

    console.log('WPAICB: Widget initialized with config:', {
      restUrl: window.WPAICB.restUrl,
      siteHome: window.WPAICB.siteHome
    });

    // Run diagnostics
    console.log('WPAICB: Running REST API diagnostics...');
    const diagnosticUrl = window.WPAICB.restUrl.replace('/chat', '/health');
    fetch(diagnosticUrl)
      .then(r => {
        const info = {
          status: r.status,
          statusText: r.statusText,
          headers: {
            'content-type': r.headers.get('content-type'),
            'access-control-allow-origin': r.headers.get('access-control-allow-origin')
          }
        };
        console.log('WPAICB: Health check response:', info);
        return r.json();
      })
      .then(d => console.log('WPAICB: Health check body:', d))
      .catch(e => console.error('WPAICB: Health check failed:', e.message));

    const chat = qs(root, ".wpaicb-chat");
    const input = qs(root, ".wpaicb-msg");
    const btn = qs(root, ".wpaicb-send");

    const sessionKey = "wpaicb_sessionId";
    let sessionId;
    try {
      sessionId = localStorage.getItem(sessionKey);
    } catch (e) {
      sessionId = null;
    }
    sessionId = sessionId || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
    
    try {
      localStorage.setItem(sessionKey, sessionId);
    } catch (e) {
      // localStorage unavailable (incognito/private mode) - continue with in-memory sessionId
    }

    const WELCOME =
`Hi! I'm the assistant for this website.
I can help with:
• Quick questions & small talk
• Website search (posts/pages) and summaries
• Info about the author and skills

This bot can speak Italian and English.`;

    // Always show welcome message on widget load (including refresh)
    const w = addRow(chat, "Bot", "wpaicb-bot");
    w.bubble.textContent = WELCOME;

    async function send(){
      const message = input.value.trim();
      if (!message) return;

      input.value = "";

      const me = addRow(chat, "You", "wpaicb-me");
      me.bubble.textContent = message;

      btn.disabled = true;
      input.disabled = true;

      const thinking = addRow(chat, "Bot", "wpaicb-bot");
      thinking.bubble.textContent = "Thinking…";

      const payload = {
        message: message,
        sessionId: sessionId
      };

      let res, data;
      try{
        console.log('WPAICB: Sending request to:', WPAICB.restUrl);
        
        res = await fetch(WPAICB.restUrl, {
          method: "POST",
          // Don't send credentials for public endpoint - prevents cookie-based auth
          credentials: 'omit',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
        
        console.log('WPAICB: Response status:', res.status);
        console.log('WPAICB: Response ok:', res.ok);
        console.log('WPAICB: Response headers:', {
          'content-type': res.headers.get('content-type'),
          'server': res.headers.get('server')
        });
        
        const textData = await res.text();
        console.log('WPAICB: Raw response text:', textData.substring(0, 500));
        
        try {
          data = JSON.parse(textData);
        } catch(parseErr) {
          console.error('WPAICB: JSON parse error:', parseErr.message);
          console.error('WPAICB: First 200 chars of response:', textData.substring(0, 200));
          throw parseErr;
        }
        
        console.log('WPAICB: Response data:', data);
      } catch(e){
        console.error('WPAICB: Fetch error:', e);
        thinking.bubble.textContent = "❌ Network error: " + e.message;
        btn.disabled = false;
        input.disabled = false;
        input.focus();
        return;
      }

      // Check for HTTP errors
      if (!res.ok) {
        console.error('WPAICB: HTTP error', res.status, data);
        let errorMsg = `Server error`;
        
        if (res.status === 403) {
          errorMsg = '❌ Permission denied (403). Possible issues:\n' +
                     '1. Cloudflare Access blocking the request\n' +
                     '2. Check if /wp-json/wpaicb/v1/* is in your whitelist\n' +
                     '3. Check plugin settings in WordPress admin';
        } else if (res.status === 404) {
          errorMsg = `❌ Endpoint not found (404).\n` +
                     `Check if REST API is enabled and plugin activated.\n` +
                     `URL: ${WPAICB.restUrl}`;
        } else if (res.status === 502 || res.status === 503) {
          errorMsg = `❌ Server error (${res.status}).\n` +
                     `The webhook may be down or unreachable. Check /wp-admin/debug.log`;
          if (data && data.message) {
            errorMsg += `\n\nDetails: ${data.message}`;
          }
        } else if (res.status >= 500) {
          errorMsg = `❌ Server error (${res.status}).\n` +
                     `Check WordPress debug.log for details.`;
        } else {
          errorMsg = `HTTP ${res.status}`;
          if (data && data.message) {
            errorMsg += ': ' + data.message;
          } else if (data && data.data && data.data.message) {
            errorMsg += ': ' + data.data.message;
          }
        }
        thinking.bubble.textContent = errorMsg;
        btn.disabled = false;
        input.disabled = false;
        input.focus();
        return;
      }

      const envelope = (data && typeof data === 'object' && data.data && typeof data.data === 'object') ? data.data : data;
      const body = (envelope && typeof envelope === 'object' && 'body' in envelope) ? envelope.body : '';
      const ct = (envelope && typeof envelope === 'object' && 'contentType' in envelope)
        ? envelope.contentType
        : (res.headers.get('content-type') || 'text/plain');
      const upstreamStatus = parseInt((envelope && typeof envelope === 'object' && 'status' in envelope)
        ? envelope.status
        : res.status, 10);
      renderBotReply(thinking.bubble, body, ct, upstreamStatus);

      btn.disabled = false;
      input.disabled = false;
      input.focus();
    }

    btn.addEventListener("click", send);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });

    // Removed auto-focus on page load to prevent unwanted scrolling
    // input.focus();
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('[data-wpaicb="1"]').forEach(initWidget);
  });
})();

/* biome-ignore-all lint: plain ES5 for maximum browser compatibility */
/* Trust Company AI — "Ask" widget. Usage:
   <script src="https://YOUR-CHAT-URL/widget.js" defer></script>
   Adds a floating "Ask" button (bottom-right) that opens the chat in a panel. */
(() => {
  var script = document.currentScript;
  var base =
    script && script.src ? script.src.replace(/\/widget\.js.*$/, "") : "";
  var label = (script && script.getAttribute("data-label")) || "Ask a question";
  var color = (script && script.getAttribute("data-color")) || "#1f2a44";

  var btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("aria-label", label);
  btn.innerHTML =
    '<span style="font-size:16px;line-height:1">&#128218;</span><span>' +
    label +
    "</span>";
  btn.style.cssText =
    "position:fixed;right:20px;bottom:20px;z-index:2147483000;display:flex;align-items:center;gap:8px;" +
    "padding:12px 16px;border:0;border-radius:999px;background:" +
    color +
    ";color:#fff;font:600 14px system-ui,sans-serif;" +
    "box-shadow:0 8px 24px rgba(0,0,0,.18);cursor:pointer";

  var panel = document.createElement("div");
  panel.style.cssText =
    "position:fixed;right:20px;bottom:76px;z-index:2147483000;width:min(420px,calc(100vw - 40px));height:min(640px,calc(100vh - 110px));" +
    "border-radius:16px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,.24);background:#fff;display:none";
  var frame = document.createElement("iframe");
  frame.title = "Trust Company AI — Ask";
  frame.style.cssText = "width:100%;height:100%;border:0";
  frame.loading = "lazy";
  panel.appendChild(frame);

  var open = false;
  btn.addEventListener("click", () => {
    open = !open;
    if (open && !frame.src) frame.src = base + "/embed";
    panel.style.display = open ? "block" : "none";
    btn.querySelector("span:last-child").textContent = open ? "Close" : label;
  });

  document.body.appendChild(btn);
  document.body.appendChild(panel);
})();

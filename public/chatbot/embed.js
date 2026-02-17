(function () {
  var script = document.currentScript;
  var domainId = script && script.getAttribute("data-domain-id");
  if (!domainId) {
    console.error("[SurfBloom] Missing data-domain-id on embed script.");
    return;
  }

  var origin = new URL(script.src).origin;

  // Inject styles (matches Corinna's iframeStyles pattern)
  var iframeStyles = function (styleString) {
    var style = document.createElement("style");
    style.textContent = styleString;
    document.head.append(style);
  };

  iframeStyles(
    ".chat-frame { position: fixed; bottom: 50px; right: 50px; border: none; z-index: 999999; background: transparent; }",
  );

  // Create iframe
  var iframe = document.createElement("iframe");
  iframe.src = origin + "/chatbot";
  iframe.classList.add("chat-frame");
  iframe.style.background = "transparent";
  iframe.setAttribute("allowTransparency", "true");
  document.body.appendChild(iframe);

  // Listen for messages from iframe (matches Corinna's window.addEventListener pattern)
  window.addEventListener("message", function (e) {
    if (e.origin !== origin) return;
    try {
      var dimensions = JSON.parse(e.data);
      if (
        typeof dimensions.width === "number" &&
        dimensions.width > 0 &&
        typeof dimensions.height === "number" &&
        dimensions.height > 0
      ) {
        iframe.width = dimensions.width;
        iframe.height = dimensions.height;
      }
    } catch (err) {
      return;
    }
    iframe.contentWindow.postMessage(domainId, origin + "/");
  });
})();

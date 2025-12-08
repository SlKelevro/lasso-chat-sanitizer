(async () => {
  console.log("Hook loader started");

  const hookUrl = browser.runtime.getURL("content/hook.js");
  const script = document.createElement("script");
  script.type = "module"; // file is built as ESM
  script.src = hookUrl;

  (document.head || document.documentElement).appendChild(script);
  script.remove();

  const hookListenerUrl = browser.runtime.getURL("content/hook-listener.js");
  await import(hookListenerUrl);
})();

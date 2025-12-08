(async () => {
  console.log("Content loader started");
  const url = browser.runtime.getURL("content/ui.js");
  await import(url);
})();

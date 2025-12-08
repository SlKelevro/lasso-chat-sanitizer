const self = globalThis as any;

export const isExtensionEnv =
  typeof self !== "undefined" &&
  typeof self.chrome !== "undefined" &&
  !!self.chrome.runtime &&
  !!self.chrome.runtime.id;

export async function initBrowserApi() {
  if (!isExtensionEnv) return;

  // If browser already exists (Firefox), do nothing
  if (typeof self.browser !== "undefined") return;

  await import("webextension-polyfill");
}

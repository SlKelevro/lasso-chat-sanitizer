import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { initBrowserApi } from "@/lib/runtime.ts";

console.log("Content UI started");

async function mountContentUI() {
  console.log("mountContentUI");
  await initBrowserApi();

  const host = document.createElement("div");
  host.id = "lasso-root";
  host.style.position = "fixed";
  host.style.inset = "0";
  host.style.zIndex = "12";
  host.style.pointerEvents = "none";
  document.body.appendChild(host);

  // radix-ui breaks when working from shadow dom, so disable it for now
  // const shadow = host.attachShadow({ mode: "open" });
  const shadow = host;

  const uiRoot = document.createElement("div");
  uiRoot.style.pointerEvents = "auto";
  const portalRoot = document.createElement("div");
  portalRoot.style.pointerEvents = "auto";
  const cssLink = document.createElement("link");
  cssLink.setAttribute("type", "text/css");
  cssLink.setAttribute("rel", "stylesheet");
  cssLink.setAttribute("href", browser.runtime.getURL("assets/ui.css"));
  shadow.append(cssLink, uiRoot, portalRoot);

  createRoot(uiRoot).render(
    <StrictMode>
      <App portalRoot={portalRoot} />
    </StrictMode>,
  );
}

await mountContentUI();

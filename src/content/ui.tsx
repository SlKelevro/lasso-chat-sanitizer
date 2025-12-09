import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/components/app/App.tsx";
import { initBrowserApi } from "@/lib/runtime.ts";
import { ModalProvider } from "@/content/context/ModalContext.tsx";
import { IssueProvider } from "@/content/context/IssueContext.tsx";
import { AppContextProvider } from "@/content/context/AppContext.tsx";

console.log("Content UI started");

async function mountContentUI() {
  console.log("mountContentUI");
  await initBrowserApi();

  const host = document.createElement("div");
  host.id = "lasso-root";
  host.style.position = "fixed";
  host.style.inset = "0";
  host.style.zIndex = "120";
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
      <AppContextProvider portalRoot={portalRoot}>
        <ModalProvider>
          <IssueProvider>
            <App />
          </IssueProvider>
        </ModalProvider>
      </AppContextProvider>
    </StrictMode>,
  );
}

await mountContentUI();

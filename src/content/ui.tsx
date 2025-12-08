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
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  const root = document.createElement("div");
  shadow.appendChild(root);

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

await mountContentUI();

import "./styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// ✅ Import service worker registration
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <div id="phone-wrapper">
      <App />
    </div>
  </StrictMode>
);

// ✅ Register the service worker
serviceWorkerRegistration.register();

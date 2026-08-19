import { useEffect } from "react";

const AGENT_ID = import.meta.env.VITE_ASHNA_AGENT_ID as string | undefined;
const TOKEN = import.meta.env.VITE_ASHNA_TOKEN as string | undefined;

/**
 * Loads the Ashna agent widget. The token is supplied via Vite env vars
 * (see .env) instead of being inlined in the HTML.
 */
export function AshnaWidget() {
  useEffect(() => {
    if (!AGENT_ID || !TOKEN) {
      console.warn("AshnaWidget: VITE_ASHNA_AGENT_ID or VITE_ASHNA_TOKEN is not set");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://app.ashna.ai/embed/agent-widget.js";
    script.async = true;
    script.setAttribute("data-agent-id", AGENT_ID);
    script.setAttribute("data-token", TOKEN);
    script.setAttribute("data-theme", "dark");
    script.setAttribute("data-icon-color", "#dc2626");
    script.setAttribute("data-icon-shape", "circle");
    script.setAttribute("data-icon-style", "headset");

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}

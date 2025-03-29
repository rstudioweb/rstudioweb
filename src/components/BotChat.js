"use client"; // Ensures this runs only on the client side

import { useEffect } from "react";

export default function BotChat() {
  useEffect(() => {
    // Inject Botpress Webchat script dynamically
    const script = document.createElement("script");
    script.src = "https://cdn.botpress.cloud/webchat/v2.3/inject.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.botpress.init({
        botId: "068d0f17-f71c-4cfc-b0f8-a42041171a3d",
        clientId: "e4a5e136-9a6b-4f6c-90f8-ef10ca9e6409",
        selector: "#webchat",
        configuration: {
          composerPlaceholder: "Ask Me Anything",
          botName: "Rishav (R Studio)",
          botAvatar:
            "https://files.bpcontent.cloud/2025/03/27/09/20250327095119-AXDEVYMJ.jpeg",
          color: "#3B82F6",
          variant: "soft",
          themeMode: "light",
          fontFamily: "inter",
          radius: 2,
          allowFileUpload: true,
          termsOfService: {
            title: "Terms of Service",
            link: "https://rstudio-theta.vercel.app/terms",
          },
          privacyPolicy: {
            title: "Privacy Policy",
            link: "https://rstudio-theta.vercel.app/privacy",
          },
        },
      });

      window.botpress.on("webchat:ready", () => {
        window.botpress.open();
      });
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      <style>
        {`
          #webchat .bpWebchat {
            position: unset;
            width: 100%;
            height: 100%;
            max-height: 100%;
            max-width: 100%;
          }
          #webchat .bpFab {
            display: none;
          }
        `}
      </style>
      <div id="webchat" style={{ width: "500px", height: "500px" }}></div>
    </div>
  );
}

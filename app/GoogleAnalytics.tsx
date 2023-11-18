"use client";
import Script from "next/script";
import { GoogleAnalytics } from "nextjs-google-analytics";

export default function Analytics() {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const DEV = process.env.NODE_ENV === "development";

  if (!GA_MEASUREMENT_ID) {
    console.warn("No GA_MEASUREMENT_ID found");
    return null;
  }
  return (
    <>
      <GoogleAnalytics debugMode={DEV} />
      {/* <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script> */}
    </>
  );
}

import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import "../app/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  // Ensures we only render the app client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // This approach ensures two things:
  // 1. During SSR we render only minimal content to avoid hydration mismatches
  // 2. After hydration, we show the full application
  return (
    <>
      <style jsx global>{`
        html,
        body {
          min-height: 100vh;
          background-color: white;
        }
      `}</style>
      {!mounted ? (
        // Minimal SSR version to prevent hydration mismatches
        <div suppressHydrationWarning style={{ visibility: "hidden" }}>
          Loading...
        </div>
      ) : (
        // Client-side only rendering
        <Component {...pageProps} />
      )}
    </>
  );
}

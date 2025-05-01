import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body suppressHydrationWarning>
        <Main />
        <NextScript />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove browser extension attributes that can cause hydration errors
              (function() {
                const attrs = ['bis_register', 'bis_skin_checked', '__processed', 'data-bi-id'];
                setTimeout(function() {
                  document.querySelectorAll('*').forEach(el => {
                    for (const attr of attrs) {
                      if (el.hasAttribute(attr) || el.hasAttribute(attr + '_bf3ce')) {
                        el.removeAttribute(attr);
                        el.removeAttribute(attr + '_bf3ce');
                      }
                    }
                    // Remove any attribute that starts with __processed
                    for (const attr of el.getAttributeNames()) {
                      if (attr.startsWith('__processed')) {
                        el.removeAttribute(attr);
                      }
                    }
                  });
                }, 0);
              })();
            `,
          }}
        />
      </body>
    </Html>
  );
}

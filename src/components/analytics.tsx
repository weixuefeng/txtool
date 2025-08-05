"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";
import { pageview, GA_TRACKING_ID } from "@/lib/gtag";

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!GA_TRACKING_ID || typeof window === 'undefined') return;

    // 使用 window.location.search 替代 useSearchParams
    const url = pathname + window.location.search;
    pageview(url);
  }, [pathname]);

  if (!GA_TRACKING_ID) return null;

  return (
    <>
      {/* Google Analytics 脚本 */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname + window.location.search,
            });
          `,
        }}
      />
      
      {/* Google Ads 脚本 */}
      <Script
        id="google-ads"
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3940256099942544" // 替换为您的 Google Ads 发布商 ID
        crossOrigin="anonymous"
      />
    </>
  );
}

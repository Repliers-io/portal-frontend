/* eslint-disable max-len */

import React from 'react'
import Script from 'next/script'
import * as process from 'process'

import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'

const {
  NEXT_PUBLIC_TAWK_ENABLED,
  NEXT_PUBLIC_FOLLOWUPBOSS_ENABLED,

  NEXT_PUBLIC_FOLLOWUPBOSS_ID,
  NEXT_PUBLIC_TAWK_ID
} = process.env

const tawkEnabled = NEXT_PUBLIC_TAWK_ENABLED === 'true'
const pixelEnabled = NEXT_PUBLIC_FOLLOWUPBOSS_ENABLED === 'true'
const gaId = process.env.NEXT_PUBLIC_GTAG_KEY || ''
const gtmId = process.env.NEXT_PUBLIC_GTM_KEY || ''

const TrackingInline = () => {
  return (
    <>
      {/* Note: should be enabled only one Google tag or Google Tag Manager */}
      {gaId && <GoogleAnalytics gaId={gaId} />}
      {gtmId && <GoogleTagManager gtmId={gtmId} />}

      {pixelEnabled && (
        <Script id="pixel">
          {`
          (function(w,i,d,g,e,t){w["WidgetTrackerObject"]=g;(w[g]=w[g]||function() {(w[g].q=w[g].q||[]).push(arguments);}),(w[g].ds=1*new Date());(e="script"), (t=d.createElement(e)),(e=d.getElementsByTagName(e)[0]);t.async=1;t.src=i; e.parentNode.insertBefore(t,e);}) (window,"https://widgetbe.com/agent",document,"widgetTracker"); window.widgetTracker("create", "${NEXT_PUBLIC_FOLLOWUPBOSS_ID}"); window.widgetTracker("send", "pageview");
          `}
        </Script>
      )}
      {tawkEnabled && (
        <Script id="tawk">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/${NEXT_PUBLIC_TAWK_ID}/default';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>
      )}
    </>
  )
}

export default TrackingInline

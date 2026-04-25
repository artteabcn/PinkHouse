"use client";

import React from "react";
import Script from "next/script";

declare global {
  interface Window {
    BookingToolIframe: {
      initialize: (config: {
        bookingToolUrl: string;
        baseUrl: string;
        targetElement: string;
      }) => void;
    };
  }
}

interface SmoobuWidgetProps {
  bookingUrl: string;
}

export default function SmoobuWidget({ bookingUrl }: SmoobuWidgetProps): React.JSX.Element {
  function handleLoad(): void {
    if (window.BookingToolIframe) {
      window.BookingToolIframe.initialize({
        bookingToolUrl: bookingUrl,
        baseUrl: "https://login.smoobu.com/",
        targetElement: "#smoobu-booking-widget",
      });
    }
  }

  return (
    <>
      <div id="smoobu-booking-widget" className="min-h-[600px]" />
      <Script
        src="https://login.smoobu.com/js/Settings/BookingToolIframe.js"
        strategy="afterInteractive"
        onLoad={handleLoad}
      />
    </>
  );
}

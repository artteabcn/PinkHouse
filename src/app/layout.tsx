import React from "react";
import type { ReactNode } from "react";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { StudioProvider } from "@/components/providers";
import "./globals.css";

// PDF.js styles
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

export const metadata: Metadata = {
  title: "DOODL",
  description: "Drawing canvas application",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <StudioProvider>{children}</StudioProvider>
      </body>
    </html>
  );
}


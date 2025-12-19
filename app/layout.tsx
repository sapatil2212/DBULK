import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import "../styles/theme.css";
import { ThemeProvider } from "../components/theme-provider";

export const metadata: Metadata = {
  title: "DBULK - WhatsApp Marketing Platform",
  description: "Professional WhatsApp Marketing Platform by Digiworld Technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&family=Google+Sans+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className="antialiased"
        style={{ fontFamily: '"Google Sans", "Google Sans Display", -apple-system, BlinkMacSystemFont, sans-serif' }}
      >
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem 
          disableTransitionOnChange
        >
          <Toaster position="top-center" richColors />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

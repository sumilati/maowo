import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "饼饼的小窝 · 一只橘猫的成长日记",
  description: "记录饼饼的日常、体重、健康、相册，还有 AI 给饼饼写的第一人称日记和艺术照。",
  keywords: ["猫咪", "饼饼", "宠物日记", "AI", "成长记录"],
  authors: [{ name: "铲屎官" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "饼饼的小窝",
    description: "一只橘猫的成长日记",
    siteName: "饼饼的小窝",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

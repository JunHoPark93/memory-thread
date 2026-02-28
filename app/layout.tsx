import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// Geist 폰트 설정
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "기억의 실 - 소중한 기억을 대화로 이어가세요",
  description: "AI와 함께하는 어르신 기억 보존 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} antialiased`}>
        {children}
        {/* 전역 토스트 알림 */}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}

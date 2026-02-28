import ElderHeader from "@/app/_components/ElderHeader";

// 어르신 영역 공통 레이아웃 - 큰 글씨, warm 톤, 세련된 배경
export default function ElderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/80 via-amber-50/40 to-background">
      <ElderHeader />
      <main className="max-w-md mx-auto px-4 pb-8">{children}</main>
    </div>
  );
}

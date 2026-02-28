import FamilyHeader from "@/app/_components/FamilyHeader";

// 가족 영역 공통 레이아웃 - 일반 대시보드 스타일
export default function FamilyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <FamilyHeader />
      <main className="max-w-md mx-auto px-4 pb-8">{children}</main>
    </div>
  );
}

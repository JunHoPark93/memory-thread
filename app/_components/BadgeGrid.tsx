// 뱃지 데이터 (일일 대화 횟수 기준, 한국 정서 기반 이름)
const BADGES = [
  { id: "1", icon: "🍵", name: "따뜻한 마실", requiredCount: 3 },
  { id: "2", icon: "🏡", name: "정겨운 고향집", requiredCount: 5 },
  { id: "3", icon: "📷", name: "빛바랜 사진첩", requiredCount: 10 },
  { id: "4", icon: "💧", name: "지혜의 우물", requiredCount: 20 },
  { id: "5", icon: "🌳", name: "마을의 큰나무", requiredCount: 30 },
  { id: "6", icon: "🌸", name: "마음의 고향", requiredCount: 50 },
];

// 뱃지 그리드 컴포넌트 - 오늘 대화 횟수 기준으로 획득/미획득 상태 표시
export default function BadgeGrid({ dailyChatCount = 0 }: { dailyChatCount?: number }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">나의 뱃지</h2>
      <div className="grid grid-cols-3 gap-3">
        {BADGES.map((badge) => {
          const earned = badge.requiredCount <= dailyChatCount;
          return (
            <div
              key={badge.id}
              className={`flex flex-col items-center p-4 rounded-2xl border transition-all duration-200 ${
                earned
                  ? "border-orange-200 bg-gradient-to-b from-orange-50 to-amber-50/50 badge-glow hover:-translate-y-0.5"
                  : "border-border bg-muted/30 opacity-45"
              }`}
              aria-label={`${badge.name} 뱃지 ${earned ? "획득" : "미획득"}`}
            >
              {/* 뱃지 아이콘 컨테이너 */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${
                  earned
                    ? "bg-white shadow-sm ring-1 ring-orange-200"
                    : "bg-muted/50"
                }`}
              >
                <span
                  className={`text-2xl ${earned ? "" : "grayscale opacity-50"}`}
                  role="img"
                  aria-hidden="true"
                >
                  {badge.icon}
                </span>
              </div>

              {/* 뱃지 이름 */}
              <p
                className={`text-xs font-semibold text-center leading-tight ${
                  earned ? "text-orange-700" : "text-muted-foreground"
                }`}
              >
                {badge.name}
              </p>

              {/* 획득 여부 표시 */}
              {earned && (
                <span className="mt-1.5 inline-flex items-center gap-0.5 text-[10px] font-bold text-orange-500 uppercase tracking-wide">
                  ✓ 획득
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

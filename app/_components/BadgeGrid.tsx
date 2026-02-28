// 뱃지 데이터 타입
interface Badge {
  id: string;
  icon: string;
  name: string;
  description: string;
  earned: boolean;
}

// mock 뱃지 배열 (6개)
const MOCK_BADGES: Badge[] = [
  {
    id: "1",
    icon: "🌸",
    name: "첫 대화",
    description: "AI와 첫 대화를 나눴어요",
    earned: true,
  },
  {
    id: "2",
    icon: "⭐",
    name: "일주일 달성",
    description: "7일 연속으로 대화했어요",
    earned: true,
  },
  {
    id: "3",
    icon: "🌟",
    name: "이야기꾼",
    description: "10번 대화를 나눴어요",
    earned: true,
  },
  {
    id: "4",
    icon: "🏆",
    name: "한달 달성",
    description: "30일 연속으로 대화했어요",
    earned: false,
  },
  {
    id: "5",
    icon: "💎",
    name: "기억 수호자",
    description: "100번 대화를 나눴어요",
    earned: false,
  },
  {
    id: "6",
    icon: "🎖️",
    name: "전설의 이야기꾼",
    description: "365일 대화를 이어갔어요",
    earned: false,
  },
];

// 뱃지 그리드 컴포넌트 - 획득/미획득 상태 표시 (모던 스타일)
export default function BadgeGrid() {
  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">나의 뱃지</h2>
      <div className="grid grid-cols-3 gap-3">
        {MOCK_BADGES.map((badge) => (
          <div
            key={badge.id}
            className={`flex flex-col items-center p-4 rounded-2xl border transition-all duration-200 ${
              badge.earned
                ? "border-orange-200 bg-gradient-to-b from-orange-50 to-amber-50/50 badge-glow hover:-translate-y-0.5"
                : "border-border bg-muted/30 opacity-45"
            }`}
            aria-label={`${badge.name} 뱃지 ${badge.earned ? "획득" : "미획득"}`}
          >
            {/* 뱃지 아이콘 컨테이너 */}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${
                badge.earned
                  ? "bg-white shadow-sm ring-1 ring-orange-200"
                  : "bg-muted/50"
              }`}
            >
              <span
                className={`text-2xl ${badge.earned ? "" : "grayscale opacity-50"}`}
                role="img"
                aria-hidden="true"
              >
                {badge.icon}
              </span>
            </div>

            {/* 뱃지 이름 */}
            <p
              className={`text-xs font-semibold text-center leading-tight ${
                badge.earned ? "text-orange-700" : "text-muted-foreground"
              }`}
            >
              {badge.name}
            </p>

            {/* 획득 여부 표시 */}
            {badge.earned && (
              <span className="mt-1.5 inline-flex items-center gap-0.5 text-[10px] font-bold text-orange-500 uppercase tracking-wide">
                ✓ 획득
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

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

// 뱃지 그리드 컴포넌트 - 획득/미획득 상태 표시
export default function BadgeGrid() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">나의 뱃지</h2>
      <div className="grid grid-cols-3 gap-3">
        {MOCK_BADGES.map((badge) => (
          <div
            key={badge.id}
            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
              badge.earned
                ? "border-orange-300 bg-orange-50 shadow-sm"
                : "border-gray-200 bg-gray-50 opacity-50"
            }`}
          >
            {/* 뱃지 아이콘 */}
            <span
              className={`text-4xl mb-2 ${badge.earned ? "" : "grayscale"}`}
            >
              {badge.icon}
            </span>

            {/* 뱃지 이름 */}
            <p
              className={`text-xs font-semibold text-center leading-tight ${
                badge.earned ? "text-orange-700" : "text-gray-400"
              }`}
            >
              {badge.name}
            </p>

            {/* 획득 여부 표시 */}
            {badge.earned && (
              <span className="mt-1 text-xs text-orange-500 font-medium">
                획득!
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

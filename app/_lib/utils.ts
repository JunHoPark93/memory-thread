// 공통 유틸리티 함수

/**
 * 날짜를 한국어 형식으로 포맷
 * @param date - Date 객체 또는 날짜 문자열
 * @returns "2024년 1월 15일" 형식 문자열
 */
export function formatDateKo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * 상대적 시간 표시 (예: "3일 전", "방금 전")
 * @param date - Date 객체 또는 날짜 문자열
 * @returns 상대적 시간 문자열
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return formatDateKo(d);
}

/**
 * PIN 번호 마스킹 (예: "1234" → "●●●●")
 * @param pin - PIN 번호 문자열
 * @returns 마스킹된 PIN 문자열
 */
export function maskPin(pin: string): string {
  return "●".repeat(pin.length);
}

/**
 * 포인트 표시 형식 (예: 1500 → "1,500pt")
 * @param points - 포인트 숫자
 * @returns 포맷된 포인트 문자열
 */
export function formatPoints(points: number): string {
  return `${points.toLocaleString("ko-KR")}pt`;
}

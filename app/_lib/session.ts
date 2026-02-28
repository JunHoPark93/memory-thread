// 쿠키 기반 세션 관리 스텁
// 실제 구현에서는 cookies() 또는 JWT를 사용하여 세션을 관리합니다

/**
 * 어르신 세션 조회
 * @returns 어르신 ID 또는 null
 */
export async function getElderSession(): Promise<string | null> {
  return null;
}

/**
 * 가족 세션 조회
 * @returns 가족 ID 또는 null
 */
export async function getFamilySession(): Promise<string | null> {
  return null;
}

/**
 * 어르신 세션 설정
 * @param elderId - 어르신 ID
 */
export async function setElderSession(elderId: string): Promise<void> {
  // TODO: 쿠키에 세션 저장
  void elderId;
}

/**
 * 가족 세션 설정
 * @param familyId - 가족 ID
 */
export async function setFamilySession(familyId: string): Promise<void> {
  // TODO: 쿠키에 세션 저장
  void familyId;
}

/**
 * 세션 초기화 (로그아웃)
 */
export async function clearSession(): Promise<void> {
  // TODO: 쿠키 삭제
}

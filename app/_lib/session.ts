// localStorage 기반 세션 관리 (클라이언트 전용)

const ELDER_SESSION_KEY = 'mt_elder_id';
const ELDER_NAME_KEY = 'mt_elder_name';
const FAMILY_SESSION_KEY = 'mt_family_id';
const FAMILY_NAME_KEY = 'mt_family_name';

export function setElderSession(elderId: string, name?: string): void {
  localStorage.setItem(ELDER_SESSION_KEY, elderId);
  if (name) localStorage.setItem(ELDER_NAME_KEY, name);
}

export function getElderSession(): string | null {
  return localStorage.getItem(ELDER_SESSION_KEY);
}

export function getElderName(): string | null {
  return localStorage.getItem(ELDER_NAME_KEY);
}

export function setFamilySession(familyId: string, name?: string): void {
  localStorage.setItem(FAMILY_SESSION_KEY, familyId);
  if (name) localStorage.setItem(FAMILY_NAME_KEY, name);
}

export function getFamilySession(): string | null {
  return localStorage.getItem(FAMILY_SESSION_KEY);
}

export function clearSession(): void {
  localStorage.removeItem(ELDER_SESSION_KEY);
  localStorage.removeItem(ELDER_NAME_KEY);
  localStorage.removeItem(FAMILY_SESSION_KEY);
  localStorage.removeItem(FAMILY_NAME_KEY);
}

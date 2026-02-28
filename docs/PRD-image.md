# 기억복원 (Memory Restoration) PRD

## 기능 개요

- **기능명**: 기억복원
- **모델**: 나노바나나2 (`gemini-3.1-flash-image-preview`)
- **핵심**: 가족이 등록한 사진을 기반으로, 어르신과 AI의 멀티턴 대화를 통해 기억을 수집하고 이미지를 반복 생성하는 루프

---

## 사용자 역할

| 역할 | 행동 |
|------|------|
| 가족 | 사진 등록 (기존 기능, `context_images`) |
| 어르신 | 사진 선택 → AI와 대화 → 이미지 생성 요청 → 저장 |

---

## 사용자 흐름

```
[가족] context_images에 사진 등록
         ↓
[어르신] 홈 → [기억복원] 카드 클릭
         ↓
      PIN 로그인 (next=memory)
         ↓
      /elder/memory 진입
         ↓
      가족이 등록한 사진 그리드 표시 (context_images)
         ↓
      어르신이 사진 선택
         ↓
      나노바나나2: 사진 분석 → 설명 + 첫 질문 (멀티턴 채팅 시작)
         ↓
      어르신: 기억 추가 ("그날 비가 왔어", "동생도 있었어" 등)
         ↓
      [이미지 만들기] → 나노바나나2: 기억 반영 이미지 생성
         ↓
      원본 vs 생성 이미지 비교 → [재생성] or [저장]
         ↓
      저장: memory_restorations DB + elder-images Storage
```

---

## 기능 명세

### F012: 기억복원 기능

| ID | 기능 | 설명 |
|----|------|------|
| F012-1 | 사진 선택 | context_images에서 가족 등록 사진 그리드 표시 |
| F012-2 | 사진 분석 | 나노바나나2가 선택한 사진 분석 + 첫 질문 생성 |
| F012-3 | 멀티턴 대화 | 어르신 기억 추가 → AI 공감 + 추가 질문 |
| F012-4 | 이미지 생성 | 수집된 기억을 반영한 새 이미지 생성 |
| F012-5 | 재생성 루프 | 피드백 → 기억 추가 → 재생성 반복 |
| F012-6 | 저장 | memory_restorations 테이블 + elder-images Storage |
| F012-7 | context_texts 활용 | 어르신 배경 정보(고향/가족/직업 등)를 프롬프트에 반영 |

---

## 화면 단계 (상태 머신)

| Step | 화면 | 핵심 동작 |
|------|------|---------|
| `select` | 사진 그리드 | 사진 선택 |
| `analyzing` | 로딩 스피너 | 자동 진행 |
| `chat` | 대화 인터페이스 | 기억 추가 + [이미지 만들기] 버튼 |
| `generating` | 로딩 스피너 | 자동 진행 |
| `preview` | 원본 vs 생성 이미지 비교 | [재생성] or [저장] |
| `saved` | 완료 화면 | [홈으로] |

---

## 데이터 모델

### memory_restorations 테이블

```sql
CREATE TABLE memory_restorations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  elder_id UUID REFERENCES elders(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,   -- context_images에서 선택한 원본 사진
  restored_image_url TEXT,            -- AI가 생성한 복원 이미지 URL
  conversation JSONB DEFAULT '[]',    -- 대화 기록 (role, parts)
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 연관 테이블

- `context_images`: 입력 소스 (가족이 등록한 원본 사진)
- `context_texts`: AI 프롬프트 개인화 (고향/가족/직업/취미/추억/건강)
- `elders`: 어르신 정보

---

## 기술 구현

### API: POST /api/memory/chat

**요청**:
```typescript
{
  elderId: string,
  imageUrl: string,        // 원본 사진 URL (첫 요청에만 사용)
  history: ChatTurn[],     // 이전 대화 기록
  message: string,         // 어르신 메시지
  generateImage: boolean,  // 이미지 생성 요청 여부
  restorationId?: string
}
```

**응답**:
```typescript
{
  text: string,
  imageBase64?: string,
  imageMimeType?: string,
  restoredImageUrl?: string,  // generateImage=true일 때
  restorationId: string
}
```

### 모델: 나노바나나2

- 모델 ID: `gemini-3.1-flash-image-preview`
- responseModalities: `["TEXT", "IMAGE"]`
- 멀티턴 채팅: `startChat({ history })` 방식
- 이미지 컨텍스트 자동 유지 (첫 메시지에만 인라인 데이터 전송)
- 타임아웃: 60초 (AbortController)

### Storage 경로

- 버킷: `elder-images`
- 경로: `{elderId}/restored-{timestamp}.png`

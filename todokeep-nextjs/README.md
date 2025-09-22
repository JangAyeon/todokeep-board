# TodoKeep Frontend 🎨

실시간 협업 할 일 관리 시스템의 프론트엔드 애플리케이션입니다. Next.js와 Material-UI를 활용하여 현대적이고 반응형 사용자 인터페이스를 제공합니다.

## 🛠 기술 스택

- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) v7
- **Styling**: Tailwind CSS v4, Emotion
- **Real-time**: Socket.IO Client
- **State Management**: React Hooks (useState, useEffect)
- **Development**: ESLint, TypeScript

## ✨ 주요 기능

### 🎨 사용자 인터페이스

- **반응형 디자인**: 다양한 디바이스에서 최적화된 경험
- **Material Design**: 구글의 Material Design 가이드라인 준수
- **Dark/Light 테마**: 사용자 선호도에 따른 테마 지원
- **직관적인 UX**: 드래그 앤 드롭, 인라인 편집 등 현대적 인터랙션

### 📋 Board 관리

- Board 목록 조회 및 생성
- Board 제목 인라인 편집
- Board 삭제 기능
- 실시간 Board 변경사항 동기화

### ✅ Task 관리

- Task 생성, 수정, 삭제
- Task 완료 상태 토글
- 인라인 텍스트 편집
- 완료/미완료 Task 분리 표시

### 🔄 실시간 기능

- Socket.IO 기반 실시간 양방향 통신
- 다중 사용자 동시 편집 지원
- 자동 동기화 및 충돌 방지
- 연결 상태 관리 및 재연결

## 📁 프로젝트 구조

```
src/
├── app/                       # Next.js App Router
│   ├── layout.tsx             # 전역 레이아웃
│   ├── page.tsx               # 홈페이지 (Board 목록)
│   ├── globals.css            # 전역 스타일
│   └── boards/[id]/           # 동적 라우팅
│       └── page.tsx           # Board 상세 페이지
├── lib/
│   └── socket.ts              # Socket.IO 클라이언트 설정
└── utils/
    └── config.ts              # 환경 설정
```

## 🎯 핵심 구현 포인트

### 1. 실시간 데이터 동기화

```typescript
// Socket.IO를 통한 실시간 이벤트 수신
useEffect(() => {
  socket.on("task:update", (task: Task) => {
    setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
  });

  socket.on("task:new", (task: Task) => {
    setTasks((prev) => [...prev, task]);
  });

  return () => {
    socket.off("task:update");
    socket.off("task:new");
  };
}, []);
```

### 2. 낙관적 UI 업데이트

```typescript
// 즉시 UI 업데이트 후 서버와 동기화
const toggleComplete = async (task: Task) => {
  // 1. 낙관적 UI 업데이트
  const updated = { ...task, completed: !task.completed };
  setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));

  try {
    // 2. 서버 동기화
    const res = await fetch(`${BASE_URL}/api/tasks/${task._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: updated.completed }),
    });

    // 3. Socket으로 다른 클라이언트에 브로드캐스트
    socket.emit("task:update", updatedTask);
  } catch (err) {
    // 4. 오류 시 롤백 처리
    console.error("Failed to update task", err);
  }
};
```

### 3. SSR 하이드레이션 이슈 해결

```typescript
// 클라이언트 사이드 렌더링 보장
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) {
  return <CircularProgress />;
}
```

### 4. 동적 라우팅 및 타입 안전성

```typescript
// Next.js App Router의 동적 라우팅 활용
export default function BoardPage() {
  const params = useParams();
  const boardId = params?.id as string;

  // TypeScript 인터페이스로 타입 안전성 보장
  interface Task {
    _id: string;
    title: string;
    completed: boolean;
    boardId: string;
  }
}
```

## 🚀 실행 방법

### 1. 의존성 설치

```bash
npm install
# 또는
pnpm install
```

### 2. 환경 설정

`src/utils/config.ts`에서 백엔드 API URL을 확인하세요:

```typescript
export const BASE_URL = "http://localhost:3000";
```

### 3. 개발 서버 실행

```bash
# 개발 모드 (Turbopack 사용)
npm run dev
# 또는
pnpm dev

# 프로덕션 빌드
npm run build && npm start
```

애플리케이션은 `http://localhost:4000`에서 실행됩니다.

## 🎨 UI/UX 설계 원칙

### 1. 사용자 중심 디자인

- **직관적인 인터페이스**: 클릭 한 번으로 작업 완료
- **즉각적인 피드백**: 모든 액션에 대한 시각적 피드백
- **오류 상태 처리**: 네트워크 오류 및 로딩 상태 명확히 표시

### 2. 성능 최적화

- **Next.js App Router**: 최신 라우팅 시스템으로 성능 향상
- **컴포넌트 최적화**: 불필요한 리렌더링 방지
- **번들 최적화**: Tree-shaking으로 번들 크기 최소화

### 3. 접근성 (a11y)

- **키보드 네비게이션**: 모든 기능을 키보드로 조작 가능
- **스크린 리더 지원**: ARIA 라벨과 시맨틱 HTML 사용
- **색상 대비**: WCAG 가이드라인 준수

## 🎭 컴포넌트 구조

### Board List Page (`/`)

- 전체 Board 목록 표시
- 새 Board 생성 폼
- Board 편집/삭제 기능
- 그리드 레이아웃 적용

### Board Detail Page (`/boards/[id]`)

- 특정 Board의 Task 목록
- Task 생성/편집/삭제
- 완료/미완료 Task 분리
- 실시간 업데이트 지원

## 📱 반응형 디자인

```css
/* Tailwind CSS를 활용한 반응형 그리드 */
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
  {/* Board 카드들 */}
</div>
```

### 브레이크포인트

- **Mobile**: < 640px (1열)
- **Tablet**: 640px ~ 768px (2열)
- **Desktop**: > 768px (3열)

## 🔧 상태 관리 패턴

### 1. 로컬 상태 관리

```typescript
// React Hooks를 활용한 상태 관리
const [tasks, setTasks] = useState<Task[]>([]);
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);
```

### 2. Socket 상태 관리

```typescript
// Socket 연결 상태 및 Room 관리
useEffect(() => {
  socket.emit("join-board", boardId);

  return () => {
    socket.emit("leave-board", boardId);
  };
}, [boardId]);
```

## 🧪 테스트

```bash
# 린트 검사
npm run lint

# 타입 체크
npx tsc --noEmit

# 빌드 테스트
npm run build
```

## 🎯 성능 최적화 전략

### 1. React 최적화

- **useCallback/useMemo**: 불필요한 리렌더링 방지
- **React.memo**: 컴포넌트 메모이제이션
- **Lazy Loading**: 코드 스플리팅으로 초기 로딩 시간 단축

### 2. Next.js 최적화

- **Image Optimization**: next/image로 이미지 최적화
- **Font Optimization**: next/font로 폰트 최적화
- **Bundle Analysis**: 번들 크기 분석 및 최적화

### 3. 사용자 경험 최적화

- **Skeleton Loading**: 콘텐츠 로딩 중 스켈레톤 화면
- **Error Boundaries**: 에러 발생 시 대체 UI 제공
- **Optimistic Updates**: 서버 응답 전 UI 즉시 업데이트

## 🔧 개선 사항 및 확장 가능성

- [ ] 사용자 인증 시스템 (NextAuth.js)
- [ ] PWA 지원 (오프라인 모드)
- [ ] 드래그 앤 드롭 Task 재정렬
- [ ] 다국어 지원 (i18n)
- [ ] 테스트 코드 작성 (Jest, React Testing Library)
- [ ] Storybook을 활용한 컴포넌트 문서화
- [ ] 성능 모니터링 (Web Vitals)

## 📞 문의

프로젝트에 대한 질문이나 개선사항이 있다면 언제든 연락주세요!

# TodoKeep API 🚀

협업 기반의 실시간 할일 관리 애플리케이션입니다. 이 프로젝트는 Next.js 프론트엔드에서 Drag & Drop, 상태 관리, Socket.io 클라이언트 구현을 경험하고, NestJS 백엔드의 REST API, 데이터베이스 연동, 실시간 이벤트 처리를 이해하는 데 초점을 맞추고 있습니다.

## 🛠 기술 스택

- **Framework**: NestJS (TypeScript)
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO
- **Architecture**: RESTful API, Event-driven Architecture
- **Validation**: Class-validator, Class-transformer
- **Testing**: Jest

## ✨ 주요 기능

### 🏗 아키텍처 특징

- **모듈화된 구조**: Board, Task, Upload 모듈로 분리
- **실시간 이벤트**: Socket.IO를 통한 실시간 데이터 동기화
- **Event Emitter 패턴**: 서비스 간 느슨한 결합을 위한 이벤트 기반 통신
- **RESTful API**: 표준 HTTP 메서드를 활용한 직관적인 API 설계

## 🎯 주요 기능과 사용 기술

### Board Management

- Board CRUD 작업
- Board별 Task 조회 및 관리
- 실시간 Board 변경사항 동기화

### Task Management

- Task 생성, 수정, 삭제
- Task 완료 상태 토글
- Board별 Task 필터링

### Real-time Features

- Socket.IO 기반 실시간 양방향 통신
- Board/Task 변경사항 실시간 브로드캐스트
- 클라이언트별 Room 관리

### Board Screen Feature

- Drag & Drop: dnd-kit 라이브러리로 구현하는 인터랙티브 UI
- 진행률 추적: 컴포넌트 상태와 계산 로직
- 반응형 UI: Material-UI + Tailwind CSS 혼합 사용

## 개발 과정

1. [보드 순서 바꾸기](https://hixsch-kixsch59.tistory.com/130)
2. [실시간 보드 하위 태스크 달성률 보이기](https://hixsch-kixsch59.tistory.com/131)

## 📦 프로젝트 구조 (및 학습 포인트)

```
todokeep-monorepo/
├── todokeep-api/              # ✨ NestJS 백엔드 (처음 배우는 프레임워크)
│   ├── src/
│   │   ├── boards/            # 📚 NestJS 모듈 구조 학습
│   │   │   ├── boards.controller.ts    # HTTP 라우팅
│   │   │   ├── boards.service.ts       # 비즈니스 로직 & DB 쿼리
│   │   │   └── board.schema.ts         # MongoDB 스키마 정의
│   │   ├── tasks/             # 관계형 데이터 설계 (Board ↔ Task)
│   │   ├── socket/            # 🔌 실시간 통신 구현
│   │   │   └── events.gateway.ts       # WebSocket 이벤트 처리
│   │   └── main.ts            # 앱 부트스트랩
│   └── package.json
│
├── todokeep-nextjs/           # 🎨 Next.js 프론트엔드 (메인 전문 영역)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # 메인 보드 페이지 (전체 UI)
│   │   │   └── boards/[id]/page.tsx  # 동적 라우팅 학습
│   │   ├── component/
│   │   │   ├── board/sortable.board.tsx    # dnd-kit 사용
│   │   │   └── task/sortable.task.tsx      # 드래그 앤 드롭 구현
│   │   └── lib/
│   │       └── socket.ts            # Socket.io 클라이언트 초기화
│   └── package.json
│
├── packages/shared/           # 🔗 모노레포의 강력함
│   └── src/
│       └── types.ts           # 프론트&백 공유 타입 정의 (DRY 원칙)
│
└── pnpm-workspace.yaml        # pnpm workspaces로 의존성 관리
```

### 💡 아키텍처 선택 배경:

- 모노레포: 여러 패키지를 한 곳에서 관리하면서 타입 안정성 확보
- pnpm: npm보다 빠르고 효율적인 패키지 관리
- shared 패키지: 프론트&백에서 동일한 인터페이스/타입/상수 사용 → 타입 안정성 ↑

## 🗃 데이터베이스 스키마

### Board Schema

```typescript
{
  title: string;
  taskIds: string[];  // Task 참조 (one-to-many)
}
```

### Task Schema

```typescript
{
  title: string;
  content: string;
  completed: boolean;
  boardId: string; // Board 참조
}
```

## 🔌 API 엔드포인트

### Board APIs

```
GET    /api/boards        # 전체 Board 목록 조회
GET    /api/boards/:id    # 특정 Board 및 연관 Task 조회
POST   /api/boards        # 새 Board 생성
PUT    /api/boards/:id    # Board 제목 수정
DELETE /api/boards/:id    # Board 및 연관 Task 삭제
```

### Task APIs

```
GET    /api/tasks/:id     # 특정 Task 조회
POST   /api/tasks         # 새 Task 생성
PUT    /api/tasks/:id     # Task 수정 (제목/완료상태)
DELETE /api/tasks/:id     # Task 삭제
```

## 🔄 Socket.IO 이벤트

### 클라이언트 → 서버

- `join-board`: 특정 Board 룸 참여
- `leave-board` : Board 룸 나가기

### 서버 → 클라이언트

- `board:new` : 새 Board 생성 알림
- `board:update` : Board 수정 알림
- `board:delete` : Board 삭제 알림
- `task:new` : 새 Task 생성 알림
- `task:update` : Task 수정 알림
- `task:delete` : Task 삭제 알림

## 🚀 실행 방법

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 설정

MongoDB 연결 정보를 확인하세요:

```typescript
// app.module.ts
MongooseModule.forRoot("mongodb://localhost/todokeep-apiv2");
```

### 3. 개발 서버 실행

```bash
# 개발 모드 (watch mode)
pnpm run start:dev

# 프로덕션 빌드
pnpm run build
pnpm run start:prod
```

서버는 `http://localhost:3000`에서 실행됩니다.

## 🧪 테스트

```bash
# 단위 테스트
pnpm run test

# e2e 테스트
pnpm run test:e2e

# 테스트 커버리지
pnpm run test:cov
```

## 🏗 핵심 구현 포인트

### 1. 이벤트 기반 아키텍처

```typescript
// EventEmitter를 통한 서비스 간 통신
this.eventEmitter.emit('board.new', created);

// Socket Gateway에서 이벤트 수신
@OnEvent('board.new')
handleBoardNew(data: any) {
  this.server.emit('board:new', data);
}
```

### 2. MongoDB 관계형 데이터 처리

```typescript
// Board 조회 시 연관 Task 함께 조회
const board = await this.boardModel.findById(boardId).exec();
const tasks = await this.taskModel.find({ boardId }).exec();
return { ...board.toObject(), tasks };
```

### 3. CORS 및 Socket.IO 설정

```typescript
// 프론트엔드 연결을 위한 CORS 설정
app.enableCors({
  origin: "http://localhost:4000",
  credential: false,
});

// Socket.IO 어댑터 설정
app.useWebSocketAdapter(new SocketIoAdapter(app));
```

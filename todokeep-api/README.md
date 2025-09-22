# TodoKeep API 🚀

실시간 협업 할 일 관리 시스템의 백엔드 API입니다. NestJS와 Socket.IO를 활용하여 실시간 동기화 기능을 제공하는 RESTful API입니다.

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

### 📋 Board Management

- Board CRUD 작업
- Board별 Task 조회 및 관리
- 실시간 Board 변경사항 동기화

### ✅ Task Management

- Task 생성, 수정, 삭제
- Task 완료 상태 토글
- Board별 Task 필터링

### 🔄 Real-time Features

- Socket.IO 기반 실시간 양방향 통신
- Board/Task 변경사항 실시간 브로드캐스트
- 클라이언트별 Room 관리

## 📁 프로젝트 구조

```
src/
├── app.module.ts              # 메인 애플리케이션 모듈
├── boards/                    # Board 관련 기능
│   ├── board.schema.ts        # MongoDB 스키마 정의
│   ├── boards.controller.ts   # REST API 엔드포인트
│   ├── boards.service.ts      # 비즈니스 로직
│   └── dto/                   # 데이터 전송 객체
├── tasks/                     # Task 관련 기능
│   ├── task.schema.ts         # MongoDB 스키마 정의
│   ├── tasks.controller.ts    # REST API 엔드포인트
│   ├── tasks.service.ts       # 비즈니스 로직
│   └── dto/                   # 데이터 전송 객체
└── socket/                    # 실시간 통신
    ├── events.gateway.ts      # Socket.IO 이벤트 처리
    └── socket-io.adapter.ts   # Socket.IO 어댑터 설정
```

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
MongooseModule.forRoot('mongodb://localhost/todokeep-apiv2');
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
  origin: 'http://localhost:4000',
  credential: false,
});

// Socket.IO 어댑터 설정
app.useWebSocketAdapter(new SocketIoAdapter(app));
```

## 🎯 성능 최적화

- **이벤트 기반 통신**: 서비스 간 느슨한 결합으로 확장성 향상
- **MongoDB 인덱싱**: boardId 기반 효율적 쿼리
- **Room 기반 Socket 관리**: 필요한 클라이언트에만 이벤트 전송

## 🔧 개선 사항 및 확장 가능성

- [ ] JWT 인증/인가 시스템 추가
- [ ] Redis를 활용한 캐싱 레이어 구현
- [ ] Docker 컨테이너화 및 배포 자동화
- [ ] API 문서화 (Swagger/OpenAPI)
- [ ] 로깅 및 모니터링 시스템 구축
- [ ] Rate Limiting 및 보안 강화

## 📞 문의

프로젝트에 대한 질문이나 개선사항이 있다면 언제든 연락주세요!

// 공통 타입 정의
export interface Task {
  _id: string;
  title: string;
  completed: boolean;
  boardId: string;
  order: number;
}

export interface Board {
  _id: string;
  title: string;
  taskIds: string[];
  order: number;
}

export interface BoardWithTasks extends Board {
  tasks: Task[];
}

// Socket 이벤트 타입
export interface SocketEvents {
  "board:new": (board: Board) => void;
  "board:update": (board: Board) => void;
  "board:delete": (id: string) => void;
  "task:new": (task: Task) => void;
  "task:update": (task: Task) => void;
  "task:delete": (id: string) => void;
}

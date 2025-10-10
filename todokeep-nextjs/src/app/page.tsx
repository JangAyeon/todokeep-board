"use client";

import { useEffect, useState } from "react";
import socket from "@/lib/socket";
import AddIcon from "@mui/icons-material/Add";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import SortableBoardCard from "@/component/board/sortable.board";

export interface Task {
  _id: string;
  title: string;
  completed: boolean;
  boardId: string;
}

interface BoardWithTasks {
  _id: string;
  title: string;
  order: number;
  tasks: Task[];
}

export default function Home() {
  const [boards, setBoards] = useState<BoardWithTasks[]>([]);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch initial boards with tasks
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/boards/all/with-tasks`)
      .then((res) => res.json())
      .then(setBoards)
      .catch((err) => console.error("Failed to fetch boards:", err));
  }, []);

  // Socket setup
  useEffect(() => {
    socket.emit("join-board", "all-boards");

    socket.on("board:new", (newBoard) => {
      setBoards((prev) => [...prev, { ...newBoard, tasks: [] }]);
    });

    socket.on("board:update", (updatedBoard) => {
      setBoards((prev) =>
        prev.map((board) =>
          board._id === updatedBoard._id
            ? { ...board, title: updatedBoard.title }
            : board
        )
      );
    });

    socket.on("board:delete", (deletedBoardId) => {
      setBoards((prev) => prev.filter((board) => board._id !== deletedBoardId));
    });

    socket.on("board:reorder", (reorderedBoards) => {
      // Preserve tasks when reordering
      setBoards((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return reorderedBoards.map((reorderedBoard: any) => {
          const existingBoard = prev.find((b) => b._id === reorderedBoard._id);
          return {
            ...reorderedBoard,
            tasks: existingBoard?.tasks || [],
          };
        });
      });
    });

    // Listen for task updates to refresh board stats
    socket.on("task:new", (newTask) => {
      setBoards((prev) =>
        prev.map((board) =>
          board._id === newTask.boardId
            ? { ...board, tasks: [...board.tasks, newTask] }
            : board
        )
      );
    });

    socket.on("task:update", (updatedTask) => {
      setBoards((prev) =>
        prev.map((board) =>
          board._id === updatedTask.boardId
            ? {
                ...board,
                tasks: board.tasks.map((task) =>
                  task._id === updatedTask._id ? updatedTask : task
                ),
              }
            : board
        )
      );
    });

    socket.on("task:delete", (deletedTaskId) => {
      setBoards((prev) =>
        prev.map((board) => ({
          ...board,
          tasks: board.tasks.filter((task) => task._id !== deletedTaskId),
        }))
      );
    });

    return () => {
      socket.off("board:new");
      socket.off("board:update");
      socket.off("board:delete");
      socket.off("board:reorder");
      socket.off("task:new");
      socket.off("task:update");
      socket.off("task:delete");
    };
  }, []);

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBoards((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Save the new order to the backend
        const boardIds = newOrder.map((b) => b._id);
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/boards/reorder`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ boardIds }),
        }).catch((err) => console.error("Failed to save board order:", err));

        return newOrder;
      });
    }
  };

  // Handle create board
  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) return;

    setIsCreating(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/boards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newBoardTitle }),
      });
      setNewBoardTitle("");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle edit board title
  const handleEditBoard = async (id: string) => {
    const newTitle = editingTitle.trim();
    if (!newTitle) return;

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/boards/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title: newTitle }),
    });

    setEditingId(null);
  };

  // Handle delete board
  const handleDeleteBoard = async (id: string) => {
    if (!confirm("정말 이 보드를 삭제하시겠습니까?")) return;

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/boards/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-8 flex items-center gap-3">
          <AssignmentOutlinedIcon
            fontSize="large"
            className="text-blue-600 text-4xl"
          />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Boards</h1>
            <p className="text-slate-600">
              프로젝트 보드를 관리하고 작업을 추적하세요
            </p>
          </div>
        </div>

        {/* Create Board Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            새 보드 만들기
          </label>
          <div className="flex gap-3">
            <input
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCreateBoard()}
              placeholder="보드 이름을 입력하세요"
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isCreating}
            />
            <button
              onClick={handleCreateBoard}
              disabled={isCreating || !newBoardTitle.trim()}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <AddIcon className="text-xl" />
              {isCreating ? "생성 중..." : "생성"}
            </button>
          </div>
        </div>

        {/* Boards Grid with Drag and Drop */}
        {boards.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={boards.map((b) => b._id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {boards.map((board) => (
                  <SortableBoardCard
                    key={board._id}
                    board={board}
                    editingId={editingId}
                    editingTitle={editingTitle}
                    setEditingTitle={setEditingTitle}
                    setEditingId={setEditingId}
                    handleEditBoard={handleEditBoard}
                    handleDeleteBoard={handleDeleteBoard}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-300">
            <div className="text-slate-300 my-4">
              <DashboardOutlinedIcon sx={{ fontSize: 64 }} />
            </div>
            <p className="text-slate-600 font-medium mb-1">
              아직 보드가 없습니다
            </p>
            <p className="text-slate-500 text-sm">
              위에서 새 보드를 만들어 시작하세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

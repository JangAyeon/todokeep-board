"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import socket from "@/lib/socket";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

export default function Home() {
  const [boards, setBoards] = useState<any[]>([]);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Fetch initial boards
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/boards`)
      .then((res) => res.json())
      .then(setBoards);
  }, []);

  // Socket setup
  useEffect(() => {
    socket.emit("join-board", "all-boards");

    socket.on("board:new", (newBoard) => {
      setBoards((prev) => [...prev, newBoard]);
    });

    socket.on("board:update", (updatedBoard) => {
      setBoards((prev) =>
        prev.map((board) =>
          board._id === updatedBoard._id ? updatedBoard : board
        )
      );
    });

    socket.on("board:delete", (deletedBoardId) => {
      setBoards((prev) => prev.filter((board) => board._id !== deletedBoardId));
    });

    return () => {
      socket.off("board:new");
      socket.off("board:update");
      socket.off("board:delete");
    };
  }, []);

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

        {/* Boards Grid */}
        {boards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {boards.map((board) => (
              <div
                key={board._id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200"
              >
                {editingId === board._id ? (
                  <div className="p-5 space-y-3">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleEditBoard(board._id)
                      }
                      className="w-full px-3 py-2 text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditBoard(board._id)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckIcon className="text-base" />
                        저장
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 px-3 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center gap-1"
                      >
                        <CloseIcon className="text-base" />
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5">
                    <Link href={`/boards/${board._id}`} className="block group">
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-1 flex items-center justify-between">
                        {board.title}
                        <ArrowForwardIcon className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all text-xl" />
                      </h3>
                      <p className="text-sm text-slate-500">클릭하여 열기</p>
                    </Link>
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setEditingId(board._id);
                          setEditingTitle(board.title);
                        }}
                        className="flex-1 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <EditOutlinedIcon className="text-base" />
                        수정
                      </button>
                      <div className="w-px h-4 bg-slate-200" />
                      <button
                        onClick={() => handleDeleteBoard(board._id)}
                        className="flex-1 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <DeleteOutlineIcon className="text-base" />
                        삭제
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-300">
            <div className="text-slate-300 mb-4">
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

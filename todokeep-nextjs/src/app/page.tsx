"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [boards, setBoards] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const handleCreateBoard = () => {};
  const handleDeleteBoard = (boardId: string) => {};
  const handleEditBoard = (boardId: string) => {};

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Boards List</h1>

      {/* Create Board Input */}
      <div className="mb-6 flex gap-2">
        <input
          value={newBoardTitle}
          onChange={(e) => setNewBoardTitle(e.target.value)}
          placeholder="New board title"
          className="flex-1 p-2 border rounded shadow-sm"
        />
        <button
          onClick={handleCreateBoard}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Create
        </button>
      </div>

      {/* Boards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {boards.length > 0 ? (
          boards.map((board) => (
            <div
              key={board._id}
              className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition relative group"
            >
              {editingId === board._id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="w-full p-2 border rounded"
                    style={{ color: "#1e1e1e" }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditBoard(board._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-300 px-3 py-1 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href={`/boards/${board._id}`}
                    className="font-medium block mb-2"
                    style={{ color: "#1e1e1e" }}
                  >
                    {board.title}
                  </Link>
                  <div className="flex justify-between mt-2">
                    <button
                      onClick={() => {
                        setEditingId(board._id);
                        setEditingTitle(board.title);
                      }}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBoard(board._id)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">
            No boards yet. Create one above.
          </p>
        )}
      </div>
    </div>
  );
}

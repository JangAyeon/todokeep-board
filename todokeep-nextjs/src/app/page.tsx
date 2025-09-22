'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import socket from '@/lib/socket'; // Adjust path if needed
import { BASE_URL } from '@/utils/config';

export default function Home() {
  const [boards, setBoards] = useState<any[]>([]);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Fetch initial boards
  useEffect(() => {
    fetch(`${BASE_URL}/api/boards`)
      .then((res) => res.json())
      .then(setBoards);
  }, []);

  // Join general room for all boards
  useEffect(() => {
    socket.emit('join-board', 'all-boards');

    return () => {
      socket.off('board:new');
      socket.off('board:update');
      socket.off('board:delete');
    };
  }, []);

  // Listen for new board
  useEffect(() => {
    socket.on('board:new', (newBoard) => {
      console.log(newBoard)
      setBoards((prev) => [...prev, newBoard]);
    });
  }, []);

  // Listen for board update
  useEffect(() => {
    socket.on('board:update', (updatedBoard) => {
      setBoards((prev) =>
        prev.map((board) => (board._id === updatedBoard._id ? updatedBoard : board)
      ));
    });
  }, []);

  // Listen for board delete
  useEffect(() => {
    socket.on('board:delete', (deletedBoardId) => {
      setBoards((prev) => prev.filter((board) => board._id !== deletedBoardId));
    });
  }, []);

  // Handle create board
  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) return;

    const res = await fetch(`${BASE_URL}/api/boards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newBoardTitle }),
    });

    const newBoard = await res.json();
    setNewBoardTitle('');
  };

  // Handle edit board title
  const handleEditBoard = async (id: string) => {
    const newTitle = editingTitle.trim();
    if (!newTitle) return;

    const res = await fetch(`${BASE_URL}/api/boards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title: newTitle }),
    });

    const updatedBoard = await res.json();
    setEditingId(null);
  };

  // Handle delete board
  const handleDeleteBoard = async (id: string) => {
    const res = await fetch(`${BASE_URL}/api/boards/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      // The backend will emit 'board:delete'
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Boards ( ToDO Keep Project)</h1>

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
                    style={{color:"#1e1e1e"}}
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
                  <Link href={`/boards/${board._id}`} className="font-medium block mb-2" style={{color:"#1e1e1e"}}>
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
          <p className="text-gray-500 italic">No boards yet. Create one above.</p>
        )}
      </div>
    </div>
  );
}
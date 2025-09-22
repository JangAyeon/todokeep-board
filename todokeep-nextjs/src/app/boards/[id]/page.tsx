"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Alert,
  Divider,
  TextField,
} from "@mui/material";
import socket from "@/lib/socket";
// import { NEXT_PUBLIC_BASE_URL } from "@/utils/config";
import { useParams } from "next/navigation";

interface Task {
  _id: string;
  title: string;
  completed: boolean;
  boardId: string;
}

export default function BoardPage() {
  const params = useParams();
  const boardId = params?.id as string;

  // Local state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");

  const [mounted, setMounted] = useState(false);

  // Mark as mounted after first render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load board data
  useEffect(() => {
    async function loadBoard() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/boards/${boardId}`
        );
        if (!res.ok) throw new Error("Failed to fetch board");
        const board = await res.json();

        const tasksWithBooleanCompleted = (board.tasks || []).map(
          (task: Task) => ({
            ...task,
            completed: Boolean(task.completed),
          })
        );

        setTasks(tasksWithBooleanCompleted);
        setTitle(board.title || "Untitled");
      } catch (err) {
        console.error("Error loading board:", err);
        setError("Failed to load board");
      } finally {
        setLoading(false);
      }
    }

    if (boardId) {
      loadBoard();
    }
  }, [boardId]);

  // Socket.io listeners
  useEffect(() => {
    if (!boardId) return;

    socket.emit("join-board", boardId);

    const handleTaskUpdate = (task: Task) => {
      if (task.boardId !== boardId) return;
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    };

    const handleNewTask = (task: Task) => {
      if (task.boardId !== boardId) return;
      const exists = tasks.some((t) => t._id === task._id);

      if (!exists) {
        setTasks((prev) => [...prev, task]);
      }
    };

    socket.on("task:update", handleTaskUpdate);
    socket.on("task:new", handleNewTask);

    return () => {
      socket.emit("leave-board", boardId);
      socket.off("task:update", handleTaskUpdate);
      socket.off("task:new", handleNewTask);
    };
  }, [boardId, tasks]);

  // Handlers
  const addTask = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Task", boardId }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      const newTask = await res.json();
      const exists = tasks.some((t) => t._id === newTask._id);
      console.log(exists);
      if (exists) {
        setTasks((prev) => [...prev, newTask]);
      }

      socket.emit("task:new", newTask);
    } catch (err) {
      console.error(err);
      alert("Failed to add task");
    }
  };

  const toggleComplete = async (task: Task) => {
    const updated = { ...task, completed: !task.completed };
    setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/tasks/${task._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: updated.completed }),
        }
      );

      if (!res.ok) throw new Error("Failed to update task");
      const updatedTask = await res.json();
      socket.emit("task:update", updatedTask);
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const updateTaskTitle = async (task: Task, newTitle: string) => {
    if (newTitle.trim() === "" || newTitle === task.title) return;

    const updated = { ...task, title: newTitle };
    setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/tasks/${task._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        }
      );

      if (!res.ok) throw new Error("Failed to update title");
      const updatedTask = await res.json();
      socket.emit("task:update", updatedTask);
    } catch (err) {
      console.error("Failed to update title", err);
    }
  };

  // Derived state
  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  // Hydration-safe rendering
  if (loading && !mounted) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight="bold">
          {title}
        </Typography>
        <Button variant="contained" onClick={addTask}>
          Add Task
        </Button>
      </Box>

      <List>
        {[...incompleteTasks, ...completedTasks].map((task, idx) => (
          <Box key={task._id}>
            {idx === incompleteTasks.length && incompleteTasks.length > 0 && (
              <Divider sx={{ my: 2 }} />
            )}
            <ListItem disablePadding secondaryAction={null}>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={Boolean(task.completed)}
                  onChange={() => toggleComplete(task)}
                />
              </ListItemIcon>

              {editingTaskId === task._id ? (
                <TextField
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => {
                    updateTaskTitle(task, editingTitle);
                    setEditingTaskId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateTaskTitle(task, editingTitle);
                      setEditingTaskId(null);
                    }
                  }}
                  size="small"
                  fullWidth
                  autoFocus
                />
              ) : (
                <ListItemText
                  primary={task.title}
                  onClick={() => {
                    setEditingTaskId(task._id);
                    setEditingTitle(task.title ?? "");
                  }}
                  sx={{
                    textDecoration: task.completed ? "line-through" : "none",
                    cursor: "pointer",
                  }}
                />
              )}
            </ListItem>
          </Box>
        ))}
      </List>

      {tasks.length === 0 && (
        <Typography align="center" sx={{ mt: 4 }} color="text.secondary">
          No tasks yet — add one above.
        </Typography>
      )}
    </Container>
  );
}

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
  IconButton,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import socket from "@/lib/socket";
import { useParams } from "next/navigation";
import SortableTask from "@/component/SortableTask/sortableTask";

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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
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
    const handleTaskReorder = (reorderedTasks: Task[]) => {
      setTasks(reorderedTasks);
    };
    socket.on("task:update", handleTaskUpdate);
    socket.on("task:new", handleNewTask);
    socket.on("task:reorder", handleTaskReorder);
    return () => {
      socket.emit("leave-board", boardId);
      socket.off("task:update", handleTaskUpdate);
      socket.off("task:new", handleNewTask);
      socket.off("task:reorder", handleTaskReorder);
    };
  }, [boardId, tasks]);
  // Drag end handler
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = tasks.findIndex((task) => task._id === active.id);
    const newIndex = tasks.findIndex((task) => task._id === over.id);

    const newTasks = arrayMove(tasks, oldIndex, newIndex);
    setTasks(newTasks);

    // Emit reorder to other clients
    socket.emit("task:reorder", { boardId, tasks: newTasks });

    // Optional: Save order to backend
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/boards/${boardId}/reorder`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskIds: newTasks.map((t) => t._id) }),
        }
      );
    } catch (err) {
      console.error("Failed to save task order", err);
    }
  };
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <List>
          {/* Incomplete Tasks */}
          <SortableContext
            items={incompleteTasks.map((t) => t._id)}
            strategy={verticalListSortingStrategy}
          >
            {incompleteTasks.map((task) => (
              <SortableTask
                key={task._id}
                task={task}
                editingTaskId={editingTaskId}
                editingTitle={editingTitle}
                setEditingTaskId={setEditingTaskId}
                setEditingTitle={setEditingTitle}
                toggleComplete={toggleComplete}
                updateTaskTitle={updateTaskTitle}
              />
            ))}
          </SortableContext>

          {/* Divider */}
          {incompleteTasks.length > 0 && completedTasks.length > 0 && (
            <Divider sx={{ my: 2 }} />
          )}

          {/* Completed Tasks */}
          <SortableContext
            items={completedTasks.map((t) => t._id)}
            strategy={verticalListSortingStrategy}
          >
            {completedTasks.map((task) => (
              <SortableTask
                key={task._id}
                task={task}
                editingTaskId={editingTaskId}
                editingTitle={editingTitle}
                setEditingTaskId={setEditingTaskId}
                setEditingTitle={setEditingTitle}
                toggleComplete={toggleComplete}
                updateTaskTitle={updateTaskTitle}
              />
            ))}
          </SortableContext>
        </List>
      </DndContext>

      {tasks.length === 0 && (
        <Typography align="center" sx={{ mt: 4 }} color="text.secondary">
          No tasks yet — add one above.
        </Typography>
      )}
    </Container>
  );
}

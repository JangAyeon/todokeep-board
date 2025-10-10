"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  List,
  Typography,
  Alert,
  Divider,
  Paper,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import socket from "@/lib/socket";
import { useParams, useRouter } from "next/navigation";
import SortableTask from "@/component/task/sortable.task";

interface Task {
  _id: string;
  title: string;
  completed: boolean;
  boardId: string;
}

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
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

    socket.emit("task:reorder", { boardId, tasks: newTasks });

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
  const completionRate =
    tasks.length > 0
      ? Math.round((completedTasks.length / tasks.length) * 100)
      : 0;

  // Hydration-safe rendering
  if (loading && !mounted) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ bgcolor: "grey.50" }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "grey.50",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Container maxWidth="sm">
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push("/")}
              sx={{
                color: "text.secondary",
                textTransform: "none",
                "&:hover": { bgcolor: "grey.100" },
              }}
            >
              보드로 돌아가기
            </Button>
          </Box>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: "grey.900", mb: 1 }}
              >
                {title}
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Chip
                  icon={<RadioButtonUncheckedIcon />}
                  label={`${incompleteTasks.length} 진행중`}
                  size="small"
                  sx={{
                    bgcolor: "blue.50",
                    color: "blue.700",
                    fontWeight: 500,
                  }}
                />
                <Chip
                  icon={<CheckCircleOutlineIcon />}
                  label={`${completedTasks.length} 완료`}
                  size="small"
                  sx={{
                    bgcolor: "green.50",
                    color: "green.700",
                    fontWeight: 500,
                  }}
                />
                {tasks.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {completionRate}% 완료
                  </Typography>
                )}
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addTask}
              sx={{
                bgcolor: "blue.600",
                textTransform: "none",
                px: 3,
                py: 1.25,
                borderRadius: 2,
                fontWeight: 600,
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "blue.700",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
                },
              }}
            >
              작업 추가
            </Button>
          </Box>
        </Paper>

        {/* Tasks List */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "grey.200",
            minHeight: 400,
          }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <List sx={{ p: 0 }}>
              {/* Incomplete Tasks */}
              {incompleteTasks.length > 0 && (
                <Box mb={2}>
                  <Typography
                    variant="overline"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 600,
                      letterSpacing: 1,
                      display: "block",
                      mb: 1,
                    }}
                  >
                    진행중 ({incompleteTasks.length})
                  </Typography>
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
                </Box>
              )}

              {/* Divider */}
              {incompleteTasks.length > 0 && completedTasks.length > 0 && (
                <Divider sx={{ my: 3 }} />
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 600,
                      letterSpacing: 1,
                      display: "block",
                      mb: 1,
                    }}
                  >
                    완료됨 ({completedTasks.length})
                  </Typography>
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
                </Box>
              )}
            </List>
          </DndContext>

          {/* Empty State */}
          {tasks.length === 0 && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={8}
            >
              <CheckCircleOutlineIcon
                sx={{ fontSize: 64, color: "grey.300", mb: 2 }}
              />
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 1, fontWeight: 500 }}
              >
                아직 작업이 없습니다
              </Typography>
              <Typography variant="body2" color="text.secondary">
                위의 `작업 추가` 버튼을 눌러 시작하세요
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

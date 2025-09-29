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

interface Task {
  _id: string;
  title: string;
  completed: boolean;
  boardId: string;
}

function SortableTask({
  task,
  editingTaskId,
  editingTitle,
  setEditingTaskId,
  setEditingTitle,
  toggleComplete,
  updateTaskTitle,
}: {
  task: Task;
  editingTaskId: string | null;
  editingTitle: string;
  setEditingTaskId: (id: string | null) => void;
  setEditingTitle: (title: string) => void;
  toggleComplete: (task: Task) => void;
  updateTaskTitle: (task: Task, title: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      disablePadding
      secondaryAction={
        <IconButton edge="end" {...attributes} {...listeners}>
          <DragIndicatorIcon />
        </IconButton>
      }
    >
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
          secondary={task._id}
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
  );
}

export default SortableTask;

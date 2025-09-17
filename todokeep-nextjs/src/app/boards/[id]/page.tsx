"use client";

import {
  Box,
  Button,
  Checkbox,
  Container,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

export default function BoardPage() {
  const [editingTitle, setEditingTitle] = useState<string>("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const addTask = () => {};
  const toggleComplete = () => {};
  const updateTaskTitle = () => {};
  return (
    <Container>
      <Box
        display="flex"
        justifyContent={"space-between"}
        alignItems={"center"}
        mb={3}
      >
        <Typography variant="h5" fontWeight={"bold"}>
          Title of Board
        </Typography>
        <Button variant="contained" onClick={addTask}>
          {" "}
          add Task
        </Button>
      </Box>

      <List>
        <Box>
          <ListItem disablePadding secondaryAction={null}>
            <Checkbox
              edge="start"
              checked={Boolean(false)}
              onChange={toggleComplete}
            />
          </ListItem>
          {isEditing ? (
            <TextField
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={(e) => {
                updateTaskTitle();
                setEditingTaskId(0);
              }}
              onKeyDown={(e) => {
                updateTaskTitle();
                setEditingTaskId(null);
              }}
              size="small"
              fullWidth
              autoFocus
            />
          ) : (
            <ListItemText
              primary="title"
              onClick={() => {
                setEditingTaskId(null);
                setEditingTitle("");
              }}
              sx={{
                textDecoration: "none",
                cursor: "pointer",
              }}
            ></ListItemText>
          )}
        </Box>
      </List>
    </Container>
  );
}

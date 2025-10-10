import Link from "next/link";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/app/page";

// Sortable Board Card Component
function SortableBoardCard({
  board,
  editingId,
  editingTitle,
  setEditingTitle,
  setEditingId,
  handleEditBoard,
  handleDeleteBoard,
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: board._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Calculate completion stats
  const totalTasks = board.tasks?.length || 0;
  const completedTasks =
    board.tasks?.filter((t: Task) => t.completed).length || 0;
  const incompleteTasks = totalTasks - completedTasks;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Dynamic progress bar color based on completion
  const getProgressColor = () => {
    if (completionRate === 100) return "bg-teal-500";
    if (completionRate >= 70) return "bg-blue-500";
    if (completionRate >= 40) return "bg-cyan-500";
    return "bg-slate-400";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group/card bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-200"
    >
      {editingId === board._id ? (
        <div className="p-5 space-y-3">
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleEditBoard(board._id)}
            className="w-full px-3 py-2.5 text-slate-900 border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleEditBoard(board._id)}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <CheckIcon className="text-lg" />
              저장
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <CloseIcon className="text-lg" />
              취소
            </button>
          </div>
        </div>
      ) : (
        <div className="h-full p-5 flex flex-col justify-between">
          {/* Header */}
          <div className="flex flex-col items-start gap-2 my-4">
            <div className="flex items-start justify-between w-full gap-3">
              {" "}
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors  -ml-2 touch-none opacity-50 group-hover/card:opacity-100"
                aria-label="드래그하여 순서 변경"
              >
                <DragIndicatorIcon className="text-xl" />
              </button>
              <Link
                href={`/boards/${board._id}`}
                className="flex-1 block group/link"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-900 group-hover/link:text-blue-600 transition-colors leading-tight">
                    {board.title}
                  </h3>
                  <ArrowForwardIcon className="text-slate-300 group-hover/link:text-blue-600 group-hover/link:translate-x-1 transition-all text-xl flex-shrink-0 mt-0.5" />
                </div>
                {/* <p className="text-xs text-slate-400 font-medium">보드 열기</p> */}
              </Link>
            </div>

            {totalTasks > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <PendingOutlinedIcon className="text-lg text-blue-500" />
                    <span className="text-lg font-bold text-slate-800">
                      {incompleteTasks}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      진행중
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TaskAltIcon className="text-lg text-green-500" />
                    <span className="text-lg font-bold text-slate-800">
                      {completedTasks}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      완료
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Task Statistics */}
          {totalTasks > 0 ? (
            <div className="my-4 space-y-3">
              {/* Stats Row */}
              {/* <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <PendingOutlinedIcon className="text-lg text-blue-500" />
                    <span className="text-lg font-bold text-slate-800">
                      {incompleteTasks}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      진행중
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TaskAltIcon className="text-lg text-green-500" />
                    <span className="text-lg font-bold text-slate-800">
                      {completedTasks}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      완료
                    </span>
                  </div>
                </div>
              </div> */}

              {/* Progress Bar with Percentage */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">진행률</span>
                  <span className="text-sm font-bold text-slate-700">
                    {completionRate}%
                  </span>
                </div>
                <div className="relative w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`${getProgressColor()} h-full transition-all duration-500 ease-out rounded-full`}
                    style={{ width: `${completionRate}%` }}
                  />
                  {completionRate === 100 && (
                    <div className="absolute inset-0 bg-green-500 animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="my-4 py-6 flex flex-col items-center justify-center text-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <AssignmentOutlinedIcon className="text-slate-300 text-3xl mb-2" />
              <p className="text-sm text-slate-400 font-medium">작업 없음</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100 justify-end">
            <button
              onClick={() => {
                setEditingId(board._id);
                setEditingTitle(board.title);
              }}
              className="flex-1 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <EditOutlinedIcon className="text-base" />
              수정
            </button>
            <div className="w-px h-5 bg-slate-200" />
            <button
              onClick={() => handleDeleteBoard(board._id)}
              className="flex-1 py-2 text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <DeleteOutlineIcon className="text-base" />
              삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SortableBoardCard;

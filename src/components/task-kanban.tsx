"use client";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

import type { Task, TaskPriority, TaskStatus } from "@/src/lib/types";
import { useDeleteTaskMutation } from "@/src/redux/features/task/taskApi";
import { Clock, MoreHorizontal, User } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";

interface TaskKanbanProps {
  tasks: Task[];
  onUpdate?: () => void;
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "bg-slate-500" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-500" },
  { id: "review", title: "Review", color: "bg-amber-500" },
  { id: "done", title: "Done", color: "bg-emerald-500" },
];

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  high: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  urgent: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function TaskKanban({ tasks, onUpdate }: TaskKanbanProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [deleteTask] = useDeleteTaskMutation();

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
  //   e.preventDefault();
  //   if (draggedTask) {
  //     updateTaskStatus(draggedTask, status);
  //     setDraggedTask(null);
  //     // onUpdate();
  //   }
  // };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id).unwrap();
      toast.success("Task deleted successfully!");
      // onUpdate();
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task. Please try again.");
    }
  };

  return (
    <div className="w-full overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0">
      <div className="grid grid-cols-4 gap-2 sm:gap-4 min-w-[600px] sm:min-w-[700px] lg:min-w-0 pb-1">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);
          return (
            <div
              key={column.id}
              className="flex flex-col rounded-lg bg-muted/30 p-1.5 sm:p-3"
              onDragOver={handleDragOver}
              // onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-3">
                <div
                  className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${column.color}`}
                />
                <h3 className="font-medium text-[10px] sm:text-sm text-foreground truncate">
                  {column.title}
                </h3>
                <span className="text-[10px] sm:text-xs text-muted-foreground ml-auto">
                  {columnTasks.length}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 sm:gap-2 min-h-[120px] sm:min-h-[200px]">
                {columnTasks.map((task) => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task._id)}
                    className={`group rounded-md sm:rounded-lg border border-border bg-card p-1.5 sm:p-3 cursor-grab active:cursor-grabbing transition-all hover:border-primary/30 ${
                      draggedTask === task._id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-medium text-[10px] sm:text-sm text-foreground line-clamp-2 ">
                        {task.title}
                      </h4>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 sm:h-6 sm:w-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 shrink-0"
                          >
                            <MoreHorizontal className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            <span className="sr-only">Task actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDelete(task._id)}
                            className="text-destructive"
                          >
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-1 mt-1 sm:mt-2">
                      <Badge
                        className={`${
                          priorityColors[task.priority]
                        } text-[8px] sm:text-xs px-1 py-0`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1.5 sm:mt-3 text-[8px] sm:text-xs text-muted-foreground">
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <Clock className="h-2 w-2 sm:h-3 sm:w-3" />
                        <span>{task.estimate}h</span>
                      </div>
                      {task.assignees.length > 0 && (
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <User className="h-2 w-2 sm:h-3 sm:w-3" />
                          <span className="truncate  sm:max-w-[60px]">
                            {task.assignees[0].split(" ")[0]}
                          </span>
                          {task.assignees.length > 1 && (
                            <span>+{task.assignees.length - 1}</span>
                          )}
                        </div>
                      )}
                    </div>
                    {task.subtasks.length > 0 && (
                      <div className="mt-1 sm:mt-2 text-[8px] sm:text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <div className="flex-1 h-0.5 sm:h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{
                                width: `${
                                  (task.subtasks.filter((s) => s.completed)
                                    .length /
                                    task.subtasks.length) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                          <span>
                            {task.subtasks.filter((s) => s.completed).length}/
                            {task.subtasks.length}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

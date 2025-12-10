"use client";

import { useState, useMemo } from "react";
import { MoreHorizontal, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import type { Task, Sprint, TaskStatus, TaskPriority } from "@/src/lib/types";

import { EditTaskDialog } from "./edit-task-dialog";
import { useDeleteTaskMutation } from "@/src/redux/features/task/taskApi";
import { toast } from "sonner";

interface TaskTableProps {
  tasks: Task[];
  sprints: Sprint[];
  onUpdate?: () => void;
}

const statusColors: Record<TaskStatus, string> = {
  todo: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  "in-progress": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  review: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  done: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

const statusLabels: Record<TaskStatus, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
};

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  high: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  urgent: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function TaskTable({ tasks, sprints, onUpdate }: TaskTableProps) {
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [filterSprint, setFilterSprint] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortField, setSortField] = useState<
    "dueDate" | "priority" | "estimate"
  >("dueDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [deleteTask] = useDeleteTaskMutation();

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (filterSprint !== "all" && t.sprintId !== filterSprint) return false;
        if (filterAssignee !== "all" && !t.assignees.includes(filterAssignee))
          return false;
        if (filterStatus !== "all" && t.status !== filterStatus) return false;
        if (filterPriority !== "all" && t.priority !== filterPriority)
          return false;
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === "dueDate") {
          cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (sortField === "priority") {
          const order = { urgent: 0, high: 1, medium: 2, low: 3 };
          cmp = order[a.priority] - order[b.priority];
        } else if (sortField === "estimate") {
          cmp = a.estimate - b.estimate;
        }
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [
    tasks,
    filterSprint,
    filterAssignee,
    filterStatus,
    filterPriority,
    sortField,
    sortDir,
  ]);

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

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
    ) : (
      <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
    );
  };

  const getSprintName = (sprint: Sprint | string | undefined) => {
    if (!sprint) return "Unknown";
    if (typeof sprint === "string") {
      const s = sprints.find((s) => s._id === sprint);
      return s ? `Sprint ${s.sprintNumber}` : "Unknown";
    } else {
      return `Sprint ${sprint.sprintNumber}`;
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 w-full">
      <div className="w-full overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0">
        <div className="flex items-center gap-1.5 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg min-w-max">
          <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
          <Select value={filterSprint} onValueChange={setFilterSprint}>
            <SelectTrigger className="w-[90px] sm:w-[140px] h-7 sm:h-8 text-[10px] sm:text-sm">
              <SelectValue placeholder="Sprint" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sprints</SelectItem>
              {sprints.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  Sprint {s.sprintNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="w-[90px] sm:w-[140px] h-7 sm:h-8 text-[10px] sm:text-sm">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[80px] sm:w-[130px] h-7 sm:h-8 text-[10px] sm:text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[80px] sm:w-[130px] h-7 sm:h-8 text-[10px] sm:text-sm">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0">
        <div className="rounded-lg border border-border overflow-hidden min-w-[500px] sm:min-w-[600px] lg:min-w-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[140px] sm:w-[300px] text-[10px] sm:text-sm">
                  Task
                </TableHead>
                <TableHead className="text-[10px] sm:text-sm hidden md:table-cell">
                  Sprint
                </TableHead>
                <TableHead className="text-[10px] sm:text-sm hidden lg:table-cell">
                  Assignees
                </TableHead>
                <TableHead className="text-[10px] sm:text-sm">
                  <button
                    className="flex items-center hover:text-foreground"
                    onClick={() => toggleSort("priority")}
                  >
                    Priority
                    <SortIcon field="priority" />
                  </button>
                </TableHead>
                <TableHead className="text-[10px] sm:text-sm">Status</TableHead>
                <TableHead className="text-[10px] sm:text-sm hidden sm:table-cell">
                  <button
                    className="flex items-center hover:text-foreground"
                    onClick={() => toggleSort("estimate")}
                  >
                    Est.
                    <SortIcon field="estimate" />
                  </button>
                </TableHead>
                <TableHead className="text-[10px] sm:text-sm">
                  <button
                    className="flex items-center hover:text-foreground"
                    onClick={() => toggleSort("dueDate")}
                  >
                    Due
                    <SortIcon field="dueDate" />
                  </button>
                </TableHead>
                <TableHead className="w-[32px] sm:w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-6 sm:py-8 text-xs sm:text-sm"
                  >
                    No tasks match the current filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow key={task._id} className="group">
                    <TableCell className="py-2 sm:py-4">
                      <div>
                        <p className="font-medium text-foreground text-[10px] sm:text-sm line-clamp-1">
                          {task.title}
                        </p>
                        {task.subtasks.length > 0 && (
                          <p className="text-[8px] sm:text-xs text-muted-foreground mt-0.5">
                            {task.subtasks.filter((s) => s.completed).length}/
                            {task.subtasks.length} subtasks
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-2 sm:py-4 hidden md:table-cell">
                      <span className="text-[10px] sm:text-sm text-muted-foreground">
                        {getSprintName(task.sprintId)}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 sm:py-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {task.assignees.slice(0, 2).map((a) => (
                          <span
                            key={a}
                            className="inline-flex items-center rounded-full bg-primary/10 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-xs font-medium text-primary"
                          >
                            {a.split(" ")[0]}
                          </span>
                        ))}
                        {task.assignees.length > 2 && (
                          <span className="text-[8px] sm:text-xs text-muted-foreground">
                            +{task.assignees.length - 2}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-2 sm:py-4">
                      <Badge
                        className={`${
                          priorityColors[task.priority]
                        } text-[8px] sm:text-xs`}
                      >
                        {task.priority.charAt(0).toUpperCase() +
                          task.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2 sm:py-4">
                      <Badge
                        className={`${
                          statusColors[task.status]
                        } text-[8px] sm:text-xs`}
                      >
                        <span className="hidden sm:inline">
                          {statusLabels[task.status]}
                        </span>
                        <span className="sm:hidden">
                          {task.status === "in-progress"
                            ? "Progress"
                            : statusLabels[task.status]}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2 sm:py-4 hidden sm:table-cell">
                      <span className="text-[10px] sm:text-sm text-muted-foreground">
                        {task.estimate}h
                      </span>
                    </TableCell>
                    <TableCell className="py-2 sm:py-4">
                      <span className="text-[10px] sm:text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(task.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 sm:py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 sm:h-8 sm:w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="sr-only">Task actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditTask(task)}>
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(task._id)}
                            className="text-destructive"
                          >
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {editTask && (
        <EditTaskDialog
          task={editTask}
          sprints={sprints}
          open={!!editTask}
          onOpenChange={(open) => !open && setEditTask(null)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

"use client";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import type { Project, Sprint, Task } from "@/src/lib/types";
import { LayoutGrid, ListFilter, Plus, Search } from "lucide-react";
import { useState } from "react";

import { CreateTaskDialog } from "@/src/components/create-task-dialog";
import { TaskKanban } from "@/src/components/task-kanban";
import { TaskTable } from "@/src/components/task-table";

import { useGetAllProjectsQuery } from "@/src/redux/features/projects/projectApi";
import { useGetAllSprintsQuery } from "@/src/redux/features/sprint/sprintApi";
import { useGetAllTasksQuery } from "@/src/redux/features/task/taskApi";

export default function TasksPage() {
  const { data: taskRes } = useGetAllTasksQuery(undefined);
  const tasks: Task[] = taskRes?.data || [];

  const { data: Projects } = useGetAllProjectsQuery(undefined);
  const projects: Project[] = Projects?.data || [];
  const projectId = projects[0]?._id || "";

  const { data: Sprints } = useGetAllSprintsQuery(undefined);
  const sprints: Sprint[] = Sprints?.data || [];

  const [createOpen, setCreateOpen] = useState(false);
  const [view, setView] = useState<"table" | "kanban">("table");

  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredTasks = tasks.filter((task) => {
    if (search && !task.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (projectFilter !== "all" && task._id !== projectFilter) return false;
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (priorityFilter !== "all" && task.priority !== priorityFilter)
      return false;
    return true;
  });

  // Stats
  const stats = {
    total: filteredTasks.length,
    todo: filteredTasks.filter((t) => t.status === "todo").length,
    inProgress: filteredTasks.filter((t) => t.status === "in-progress").length,
    review: filteredTasks.filter((t) => t.status === "review").length,
    done: filteredTasks.filter((t) => t.status === "done").length,
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-card">
        <div className="px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Tasks</h1>
              <p className="text-sm text-muted-foreground">
                Manage all tasks across projects
              </p>
            </div>

            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>
      </header>

      {/* SEARCH + FILTERS */}
      <div className="px-6 py-6">
        <div className="mb-6 flex flex-col md:flex-row gap-3">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="md:w-[180px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p._id} value={p._id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="md:w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="md:w-[150px]">
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>

          <Tabs value={view} onValueChange={(v) => setView(v as any)}>
            <TabsList>
              <TabsTrigger value="table">
                <ListFilter className="h-4 w-4 mr-1" /> Table
              </TabsTrigger>
              <TabsTrigger value="kanban">
                <LayoutGrid className="h-4 w-4 mr-1" /> Kanban
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* TASK TABLE / KANBAN */}
        <div className="border rounded-lg overflow-x-auto">
          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">No tasks found</p>
            </div>
          ) : view === "table" ? (
            <TaskTable tasks={filteredTasks} sprints={sprints} />
          ) : (
            <TaskKanban tasks={filteredTasks} />
          )}
        </div>
      </div>

      {/* CREATE TASK MODAL */}
      <CreateTaskDialog
        projectId={projectId}
        sprints={sprints}
        open={createOpen}
        onOpenChange={setCreateOpen}
        // onCreate={onUpdate}
      />
    </div>
  );
}

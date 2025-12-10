"use client";

import { useState } from "react";
import { Plus, ListFilter, LayoutGrid } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import type { Task, Sprint } from "@/src/lib/types";
import { CreateTaskDialog } from "./create-task-dialog";
import { TaskTable } from "./task-table";
import { TaskKanban } from "./task-kanban";
import { useGetAllTasksQuery } from "@/src/redux/features/task/taskApi";

interface TaskListProps {
  projectId: string;
  sprints: Sprint[];
  onUpdate: () => void;
}

export function TaskList({ projectId, sprints, onUpdate }: TaskListProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [view, setView] = useState<"table" | "kanban">("table");
  const sprintId = sprints[0]?._id || undefined;
  // console.log("object :>> ", projectId, sprintId);
  const {
    data: taskData,
    isLoading,
    isError,
  } = useGetAllTasksQuery({
    projectId,
  });

  const tasks: Task[] = taskData?.data || [];
  console.log("tasks :>> ", tasks);

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <CardTitle className="text-base sm:text-lg">Tasks</CardTitle>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Tabs
            value={view}
            onValueChange={(v) => setView(v as "table" | "kanban")}
            className="flex-1 sm:flex-none"
          >
            <TabsList className="h-8 sm:h-9 w-full sm:w-auto">
              <TabsTrigger
                value="table"
                className="px-2 sm:px-3 flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <ListFilter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                Table
              </TabsTrigger>
              <TabsTrigger
                value="kanban"
                className="px-2 sm:px-3 flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                Kanban
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="shrink-0 h-8 sm:h-9 text-xs sm:text-sm"
          >
            <Plus className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Add</span> Task
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No tasks yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first task to start tracking work
            </p>
          </div>
        ) : view === "table" ? (
          <TaskTable tasks={tasks} sprints={sprints} onUpdate={onUpdate} />
        ) : (
          <TaskKanban tasks={tasks} onUpdate={onUpdate} />
        )}
      </CardContent>

      <CreateTaskDialog
        projectId={projectId}
        sprints={sprints}
        open={createOpen}
        onOpenChange={setCreateOpen}
        // onCreate={onUpdate}
      />
    </Card>
  );
}

"use client";

import { EditProjectDialog } from "@/src/components/edit-project-dialog";
import { SprintList } from "@/src/components/sprint-list";
import { TaskList } from "@/src/components/task-list";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Progress } from "@/src/components/ui/progress";
import { deleteProject, getProject } from "@/src/lib/project-store";
import { getSprintsByProject } from "@/src/lib/sprint-store";

import type { Project, Sprint, Task } from "@/src/lib/types";
import { useGetSingleProjectQuery } from "@/src/redux/features/projects/projectApi";
import { useGetAllSprintsQuery } from "@/src/redux/features/sprint/sprintApi";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  ListTodo,
  MoreHorizontal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const statusColors = {
  planned: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  archived: "bg-muted text-muted-foreground border-border",
};

export default function ProjectDetailPage() {
  const params = useParams();
  console.log("params :>> ", params);
  const { data, isLoading, isError } = useGetSingleProjectQuery(
    params.id as string
  );

  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { data: sprintData } = useGetAllSprintsQuery(params.id as string);

  useEffect(() => {
    if (data?.data) {
      setProject(data.data);
      setSprints(getSprintsByProject(data.data._id));
      // setTasks(getTasksByProject(data.data._id));
    }
  }, [data]);

  const handleDelete = () => {
    if (project && confirm("Are you sure you want to delete this project?")) {
      deleteProject(project._id);
      router.push("/projects");
    }
  };

  const refreshSprints = () => {
    if (params.id) {
      setSprints(getSprintsByProject(params.id as string));
    }
  };

  const refreshTasks = () => {
    if (params.id) {
      // setTasks(getTasksByProject(params.id as string));
    }
  };

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const totalTasks = tasks.length;
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const daysRemaining = Math.ceil(
    (new Date(project.endDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-background w-full">
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur ">
        <div className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8 sm:h-9 sm:w-9"
                asChild
              >
                <Link href="/projects">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="sr-only">Back to projects</span>
                </Link>
              </Button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground truncate max-w-[150px] sm:max-w-[250px] lg:max-w-none">
                    {project.title}
                  </h1>
                  <Badge
                    className={`${
                      statusColors[project.status]
                    } text-[10px] sm:text-xs shrink-0`}
                  >
                    {project.status.charAt(0).toUpperCase() +
                      project.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {project.client}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 bg-transparent h-8 w-8 sm:h-9 sm:w-9"
                >
                  <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8 w-full">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3 w-full">
          {/* Main Content */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-2 order-2 lg:order-1 min-w-0">
            {/* Thumbnail */}
            {project.thumbnail && (
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                <Image
                  src={project.thumbnail || "/placeholder.svg"}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Description */}
            <Card className="w-full">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-sm sm:text-base lg:text-lg">
                  Project Description
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground ">
                  {project.description}
                </p>
              </CardContent>
            </Card>

            {/* Sprint List */}
            <SprintList
              projectId={project._id}
              sprints={sprintData?.data || []}
              onUpdate={refreshSprints}
            />

            {/* Task List */}
            <TaskList
              projectId={project._id}
              sprints={sprintData?.data || []}
              onUpdate={refreshTasks}
            />
          </div>

          {/* Sidebar - shows first on mobile */}
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2 min-w-0">
            {/* Project Info */}
            <Card className="w-full">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-sm sm:text-base lg:text-lg">
                  Project Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-sm text-muted-foreground">
                      Client
                    </p>
                    <p className="font-medium text-foreground text-xs sm:text-base truncate">
                      {project.client}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-sm text-muted-foreground">
                      Budget
                    </p>
                    <p className="font-medium text-foreground text-xs sm:text-base">
                      ${project.budget.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-sm text-muted-foreground">
                      Start Date
                    </p>
                    <p className="font-medium text-foreground text-xs sm:text-base">
                      {new Date(project.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-sm text-muted-foreground">
                      End Date
                    </p>
                    <p className="font-medium text-foreground text-xs sm:text-base">
                      {new Date(project.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Remaining */}
            <Card className="w-full">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-sm sm:text-base lg:text-lg">
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-lg sm:text-2xl font-semibold ${
                        daysRemaining < 0
                          ? "text-destructive"
                          : daysRemaining < 14
                          ? "text-amber-500"
                          : "text-foreground"
                      }`}
                    >
                      {daysRemaining < 0
                        ? `${Math.abs(daysRemaining)}d overdue`
                        : `${daysRemaining} days`}
                    </p>
                    <p className="text-[10px] sm:text-sm text-muted-foreground">
                      {daysRemaining < 0 ? "Past deadline" : "Remaining"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* 
      <EditProjectDialog
        project={project}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdate={refreshProject}
      /> */}
    </div>
  );
}

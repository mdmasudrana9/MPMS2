"use client";

import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Progress } from "@/src/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import type { Project, Task } from "@/src/lib/types";
import { useGetAllProjectsQuery } from "@/src/redux/features/projects/projectApi";
import { useGetAllTasksQuery } from "@/src/redux/features/task/taskApi";
import {
  CheckCircle2,
  Clock,
  FolderKanban,
  ListTodo,
  TrendingUp,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function ReportsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const { data: projectData } = useGetAllProjectsQuery("");
  const { data: taskData } = useGetAllTasksQuery({});

  useEffect(() => {
    if (projectData?.data) {
      setProjects(projectData.data);
    }
    if (taskData?.data) {
      setTasks(taskData.data);
    }
  }, [projectData]);

  // Filter tasks by selected project
  const filteredTasks =
    selectedProject === "all"
      ? tasks
      : tasks.filter((t) => t.projectId === selectedProject);

  // Calculate project progress data
  const projectProgressData = projects.map((project) => {
    const projectTasks = tasks.filter((t) => t.projectId === project._id);
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(
      (t) => t.status === "done"
    ).length;
    const remainingTasks = totalTasks - completedTasks;
    const progressPercent =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const totalEstimate = projectTasks.reduce((sum, t) => sum + t.estimate, 0);
    const completedEstimate = projectTasks
      .filter((t) => t.status === "done")
      .reduce((sum, t) => sum + t.estimate, 0);
    const remainingEstimate = totalEstimate - completedEstimate;

    return {
      ...project,
      totalTasks,
      completedTasks,
      remainingTasks,
      progressPercent,
      totalEstimate,
      completedEstimate,
      remainingEstimate,
    };
  });

  // Calculate time logged per user
  const userTimeData = () => {
    const userMap = new Map<
      string,
      {
        totalHours: number;
        completedHours: number;
        remainingHours: number;
        taskCount: number;
      }
    >();

    filteredTasks.forEach((task) => {
      task.assignees.forEach((assignee) => {
        const hoursPerAssignee = task.estimate / task.assignees.length;
        const existing = userMap.get(assignee) || {
          totalHours: 0,
          completedHours: 0,
          remainingHours: 0,
          taskCount: 0,
        };

        existing.totalHours += hoursPerAssignee;
        existing.taskCount += 1;
        if (task.status === "done") {
          existing.completedHours += hoursPerAssignee;
        } else {
          existing.remainingHours += hoursPerAssignee;
        }

        userMap.set(assignee, existing);
      });
    });

    return Array.from(userMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalHours - a.totalHours);
  };

  // Summary stats
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(
    (t) => t.status === "done"
  ).length;
  const remainingTasks = totalTasks - completedTasks;
  const totalEstimate = filteredTasks.reduce((sum, t) => sum + t.estimate, 0);
  const completedEstimate = filteredTasks
    .filter((t) => t.status === "done")
    .reduce((sum, t) => sum + t.estimate, 0);
  const remainingEstimate = totalEstimate - completedEstimate;
  const overallProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statusColors: Record<string, string> = {
    active: "bg-blue-500/10 text-blue-600",
    planned: "bg-slate-500/10 text-slate-600",
    completed: "bg-emerald-500/10 text-emerald-600",
    archived: "bg-amber-500/10 text-amber-600",
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-card lg:top-0">
        <div className="px-4 py-4 md:px-6 md:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Reports</h1>
              <p className="text-sm text-muted-foreground">
                Project progress, remaining tasks, and time summaries
              </p>
            </div>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project._id} value={project._id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 md:px-6 md:py-6 space-y-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <Card>
            <CardContent className="pt-4 md:pt-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Progress
                  </p>
                  <p className="text-lg md:text-2xl font-bold">
                    {overallProgress}%
                  </p>
                </div>
              </div>
              <Progress
                value={overallProgress}
                className="mt-2 md:mt-3 h-1.5 md:h-2"
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 md:pt-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 rounded-lg bg-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Completed
                  </p>
                  <p className="text-lg md:text-2xl font-bold">
                    {completedTasks}{" "}
                    <span className="text-xs md:text-sm font-normal text-muted-foreground">
                      / {totalTasks}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 md:pt-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 rounded-lg bg-amber-500/10">
                  <ListTodo className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Remaining
                  </p>
                  <p className="text-lg md:text-2xl font-bold">
                    {remainingTasks}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 md:pt-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 rounded-lg bg-blue-500/10">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Hours Left
                  </p>
                  <p className="text-lg md:text-2xl font-bold">
                    {remainingEstimate}h{" "}
                    <span className="text-xs md:text-sm font-normal text-muted-foreground">
                      / {totalEstimate}h
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger
              value="projects"
              className="flex-1 md:flex-initial gap-1 md:gap-2 text-xs md:text-sm"
            >
              <FolderKanban className="h-4 w-4" />
              <span className="hidden sm:inline">Per</span> Project
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex-1 md:flex-initial gap-1 md:gap-2 text-xs md:text-sm"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Per</span> User
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  Project Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {projectProgressData.map((project) => (
                  <div
                    key={project._id}
                    className="space-y-3 pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold truncate">
                            {project.title}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={statusColors[project.status]}
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {project.client}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xl md:text-2xl font-bold">
                          {project.progressPercent}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          complete
                        </p>
                      </div>
                    </div>
                    <Progress value={project.progressPercent} className="h-2" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 " />
                        <span className="text-muted-foreground">
                          Completed:
                        </span>
                        <span className="font-medium">
                          {project.completedTasks} tasks
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ListTodo className="h-4 w-4 text-amber-500 " />
                        <span className="text-muted-foreground">
                          Remaining:
                        </span>
                        <span className="font-medium">
                          {project.remainingTasks} tasks
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500 " />
                        <span className="text-muted-foreground">
                          Time Left:
                        </span>
                        <span className="font-medium">
                          {project.remainingEstimate}h / {project.totalEstimate}
                          h
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {projectProgressData.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No projects found
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  Time Logged Summary (Per User)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userTimeData().map((user) => {
                    const completionPercent =
                      user.totalHours > 0
                        ? Math.round(
                            (user.completedHours / user.totalHours) * 100
                          )
                        : 0;
                    return (
                      <div
                        key={user.name}
                        className="p-3 md:p-4 rounded-lg border border-border space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 md:gap-3 min-w-0">
                            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs md:text-sm font-medium text-primary">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">
                                {user.name}
                              </p>
                              <p className="text-xs md:text-sm text-muted-foreground">
                                {user.taskCount} tasks assigned
                              </p>
                            </div>
                          </div>
                          <div className="text-right ">
                            <p className="text-lg md:text-xl font-bold">
                              {Math.round(user.totalHours)}h
                            </p>
                            <p className="text-xs text-muted-foreground">
                              total
                            </p>
                          </div>
                        </div>
                        <Progress value={completionPercent} className="h-2" />
                        <div className="grid grid-cols-3 gap-2 md:gap-4 text-sm">
                          <div className="text-center p-2 rounded bg-emerald-500/10">
                            <p className="text-base md:text-lg font-semibold text-emerald-600">
                              {Math.round(user.completedHours)}h
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Completed
                            </p>
                          </div>
                          <div className="text-center p-2 rounded bg-amber-500/10">
                            <p className="text-base md:text-lg font-semibold text-amber-600">
                              {Math.round(user.remainingHours)}h
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Remaining
                            </p>
                          </div>
                          <div className="text-center p-2 rounded bg-blue-500/10">
                            <p className="text-base md:text-lg font-semibold text-blue-600">
                              {completionPercent}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Progress
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {userTimeData().length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No user data available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

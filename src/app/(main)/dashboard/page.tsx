"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@/src/components/ui/progress";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import {
  FolderKanban,
  ListTodo,
  Users,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  CalendarDays,
} from "lucide-react";
import type { Project, Task, TeamMember } from "@/src/lib/types";
import { useGetAllProjectsQuery } from "@/src/redux/features/projects/projectApi";
import { useGetAllTasksQuery } from "@/src/redux/features/task/taskApi";
import { useGetAllTeamMembersQuery } from "@/src/redux/features/team/teamApi";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const { data: projectData } = useGetAllProjectsQuery("");
  const { data: taskData } = useGetAllTasksQuery({});
  const { data: teamMemberData } = useGetAllTeamMembersQuery("");

  useEffect(() => {
    if (projectData?.data) {
      setProjects(projectData.data as Project[]);
    }
    if (taskData?.data) {
      setTasks(taskData.data as Task[]);
    }
    if (teamMemberData?.data) {
      setTeamMembers(teamMemberData.data as TeamMember[]);
    }
  }, [projectData, taskData, teamMemberData]);

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const completedProjects = projects.filter(
    (p) => p.status === "completed"
  ).length;
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "in-progress"
  ).length;
  const urgentTasks = tasks.filter(
    (t) => t.priority === "urgent" && t.status !== "done"
  );
  const overdueTasks = tasks.filter(
    (t) => new Date(t.dueDate) < new Date() && t.status !== "done"
  );

  const totalEstimatedHours = tasks.reduce((sum, t) => sum + t.estimate, 0);
  const completedHours = tasks
    .filter((t) => t.status === "done")
    .reduce((sum, t) => sum + t.estimate, 0);

  const activeMembers = teamMembers.filter((m) => m.status === "active").length;

  const recentProjects = projects
    .filter((p) => p.status === "active")
    .slice(0, 3);

  const upcomingTasks = tasks
    .filter((t) => t.status !== "done")
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
    .slice(0, 5);

  const assigneeCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    t.assignees.forEach((a) => {
      assigneeCounts[a] = (assigneeCounts[a] || 0) + 1;
    });
  });
  const topContributors = Object.entries(assigneeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id, count]) => {
      const member = teamMembers.find((m) => m._id === id);
      const name = member?.name || `User ID: ${id}`;
      return { name, count };
    });

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/10 text-red-500";
      case "high":
        return "bg-orange-500/10 text-orange-500";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-muted text-muted-foreground";
      case "in-progress":
        return "bg-blue-500/10 text-blue-500";
      case "review":
        return "bg-purple-500/10 text-purple-500";
      default:
        return "bg-green-500/10 text-green-500";
    }
  };

  return (
    <div className="space-y-6 p-4 md:space-y-8 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Welcome back! Here's an overview of your workspace.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">
              Total Projects
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {projects.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeProjects} active, {completedProjects} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">
              Total Tasks
            </CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks} done, {inProgressTasks} in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">
              Team Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {teamMembers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeMembers} active now
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">
              Time Logged
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {completedHours}h
            </div>
            <p className="text-xs text-muted-foreground">
              of {totalEstimatedHours}h estimated
            </p>
          </CardContent>
        </Card>
      </div>

      {(urgentTasks.length > 0 || overdueTasks.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {urgentTasks.length > 0 && (
            <Card className="border-orange-500/50 bg-orange-500/5">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-sm font-medium">
                  {urgentTasks.length} Urgent Task
                  {urgentTasks.length > 1 ? "s" : ""}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {urgentTasks.slice(0, 3).map((task) => (
                    <li
                      key={task._id}
                      className="text-muted-foreground truncate"
                    >
                      {task.title}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {overdueTasks.length > 0 && (
            <Card className="border-red-500/50 bg-red-500/5">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <CardTitle className="text-sm font-medium">
                  {overdueTasks.length} Overdue Task
                  {overdueTasks.length > 1 ? "s" : ""}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {overdueTasks.slice(0, 3).map((task) => (
                    <li
                      key={task._id}
                      className="text-muted-foreground truncate"
                    >
                      {task.title}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base md:text-lg">
              Active Projects
            </CardTitle>
            <Link
              href="/projects"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active projects
                </p>
              ) : (
                recentProjects.map((project) => {
                  const progress =
                    project.totalTasks > 0
                      ? Math.round(
                          (project.completedTasks / project.totalTasks) * 100
                        )
                      : 0;
                  return (
                    <Link
                      key={project._id}
                      href={`/projects/${project._id}`}
                      className="block rounded-lg border p-3 md:p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-start justify-between gap-2 md:gap-4">
                        <div className="flex-1 space-y-1 min-w-0">
                          <h3 className="font-medium truncate">
                            {project.title}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {project.client}
                          </p>
                        </div>
                        <Badge variant="outline">{progress}%</Badge>
                      </div>
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {project.completedTasks} / {project.totalTasks}{" "}
                            tasks
                          </span>
                          <span className="hidden sm:inline">
                            Due {new Date(project.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base md:text-lg">
              Top Contributors
            </CardTitle>
            <Link
              href="/team"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topContributors.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No data available
                </p>
              ) : (
                topContributors.map((contributor, index) => (
                  <div
                    key={contributor.name}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs">
                        {getInitials(contributor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {contributor.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {contributor.count} tasks
                      </p>
                    </div>
                    {index === 0 && (
                      <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base md:text-lg">Upcoming Tasks</CardTitle>
          <Link
            href="/tasks"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming tasks</p>
            ) : (
              upcomingTasks.map((task) => {
                const project = projects.find((p) => p._id === task.projectId);
                const isOverdue = new Date(task.dueDate) < new Date();
                return (
                  <div
                    key={task._id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border p-3"
                  >
                    <div
                      className={`hidden sm:flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                        task.status === "done" ? "bg-green-500/10" : "bg-muted"
                      }`}
                    >
                      {task.status === "done" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {project?.title || "Unknown Project"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className={getPriorityColor(task.priority)}
                        variant="secondary"
                      >
                        {task.priority}
                      </Badge>
                      <Badge
                        className={getStatusColor(task.status)}
                        variant="secondary"
                      >
                        {task.status.replace("-", " ")}
                      </Badge>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <p
                        className={`text-sm ${
                          isOverdue
                            ? "font-medium text-red-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        {isOverdue
                          ? "Overdue"
                          : new Date(task.dueDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {task.estimate}h est.
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold">
              ${totalBudget.toLocaleString()}
            </p>
            <p className="text-muted-foreground text-sm">
              Total Project Budget
            </p>
          </div>
          <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {projects
              .filter((p) => p.status === "active")
              .slice(0, 3)
              .map((project) => {
                const progress =
                  project.totalTasks > 0
                    ? Math.round(
                        (project.completedTasks / project.totalTasks) * 100
                      )
                    : 0;
                return (
                  <div key={project._id} className="rounded-lg border p-4">
                    <p className="truncate text-sm font-medium">
                      {project.title}
                    </p>
                    <p className="text-xl md:text-2xl font-semibold">
                      ${project.budget.toLocaleString()}
                    </p>
                    <div className="mt-2">
                      <Progress value={progress} className="h-1.5" />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {progress}% complete
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

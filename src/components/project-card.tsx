"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import Link from "next/link";
import Image from "next/image";
import { MoreHorizontal, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Progress } from "@/src/components/ui/progress";
import type { Project } from "@/src/lib/types";
import { useDeleteProjectMutation } from "@/src/redux/features/projects/projectApi";
import { toast } from "sonner";
import { EditProjectDialog } from "./edit-project-dialog";
import { useAppSelector } from "@/src/redux/hooks";
import { selectUser, TUser } from "@/src/redux/features/auth/authSlice";

interface ProjectCardProps {
  project: Project;
  onUpdate: () => void;
}

const statusColors = {
  planned: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  archived: "bg-muted text-muted-foreground border-border",
};

export function ProjectCard({ project, onUpdate }: ProjectCardProps) {
  const [deleteProject] = useDeleteProjectMutation();
  const [editOpen, setEditOpen] = useState(false);
  const user = useAppSelector(selectUser) as TUser;
  const progress =
    project.totalTasks > 0
      ? Math.round((project.completedTasks / project.totalTasks) * 100)
      : 0;

  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "This project will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No",
      width: 350,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteProject(project._id);
        onUpdate();
        toast.success("Project deleted successfully!");
      }
    });
  };

  return (
    <>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <Link href={`/projects/${project._id}`}>
          <div className="relative aspect-video overflow-hidden bg-muted">
            {project.thumbnail ? (
              <Image
                src={project.thumbnail}
                alt={project.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-4xl font-bold text-muted-foreground/20">
                  {project.title.charAt(0)}
                </span>
              </div>
            )}
            <Badge
              className={`absolute right-3 top-3 ${
                statusColors[project.status]
              }`}
            >
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
          </div>
        </Link>

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <Link href={`/projects/${project._id}`}>
                <h3 className="truncate font-semibold text-foreground hover:underline">
                  {project.title}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground">{project.client}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/projects/${project._id}`}>View Details</Link>
                </DropdownMenuItem>
                {user.role == "admin" && (
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    Edit Project
                  </DropdownMenuItem>
                )}

                {user.role == "admin" && (
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive"
                  >
                    Delete Project
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {project.description}
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">
                {project.completedTasks}/{project.totalTasks} tasks
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(project.endDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>${project.budget.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lazy render EditProjectDialog only when project exists and editOpen is true */}
      {editOpen && project && (
        <EditProjectDialog
          project={project}
          open={editOpen}
          onOpenChange={setEditOpen}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}

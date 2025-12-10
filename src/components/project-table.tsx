"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
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
import { deleteProject } from "@/src/lib/project-store";
import { EditProjectDialog } from "./edit-project-dialog";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { useDeleteProjectMutation } from "@/src/redux/features/projects/projectApi";
import { useAppSelector } from "@/src/redux/hooks";
import { selectUser, TUser } from "@/src/redux/features/auth/authSlice";

interface ProjectTableProps {
  projects: Project[];
  onUpdate: () => void;
}

const statusColors = {
  planned: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  archived: "bg-muted text-muted-foreground border-border",
};

export function ProjectTable({ projects, onUpdate }: ProjectTableProps) {
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject] = useDeleteProjectMutation();
  const user = useAppSelector(selectUser) as TUser;
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
        deleteProject(projects[0]._id);
        onUpdate();
        toast.success("Project deleted successfully!");
      }
    });
  };

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const progress =
                project.totalTasks > 0
                  ? Math.round(
                      (project.completedTasks / project.totalTasks) * 100
                    )
                  : 0;
              return (
                <TableRow key={project._id}>
                  <TableCell>
                    <Link
                      href={`/projects/${project._id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {project.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.client}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[project.status]}>
                      {project.status.charAt(0).toUpperCase() +
                        project.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={progress} className="h-2 w-20" />
                      <span className="text-sm text-muted-foreground">
                        {progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    ${project.budget.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(project.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${project._id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {user.role == "admin" && (
                          <DropdownMenuItem
                            onClick={() => setEditProject(project)}
                          >
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
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {editProject && (
        <EditProjectDialog
          project={editProject}
          open={!!editProject}
          onOpenChange={(open) => !open && setEditProject(null)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}

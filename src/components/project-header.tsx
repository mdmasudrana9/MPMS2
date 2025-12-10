"use client";

import { useState } from "react";
import { Plus, FolderKanban } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { CreateProjectDialog } from "./create-project-dialog";
import { useAppSelector } from "@/src/redux/hooks";
import { selectUser, TUser } from "@/src/redux/features/auth/authSlice";

export function ProjectHeader() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const user = useAppSelector(selectUser) as TUser;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card lg:top-0">
      <div className="px-4 py-4 md:px-6 md:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-primary">
              <FolderKanban className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-semibold text-foreground">
                Projects
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Manage your projects and tasks
              </p>
            </div>
          </div>
          {user.role == "admin" && (
            <Button
              onClick={() => setDialogOpen(true)}
              className="gap-2 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          )}
        </div>
      </div>
      <CreateProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </header>
  );
}

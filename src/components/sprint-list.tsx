"use client";

import type React from "react";

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
import { reorderSprints } from "@/src/lib/sprint-store";
import type { Sprint } from "@/src/lib/types";
import { useDeleteSprintMutation } from "@/src/redux/features/sprint/sprintApi";
import { Calendar, GripVertical, MoreHorizontal, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CreateSprintDialog } from "./create-sprint-dialog";
import { EditSprintDialog } from "./edit-sprint-dialog";

interface SprintListProps {
  projectId: string;
  sprints: Sprint[];
  onUpdate: () => void;
}

export function SprintList({ projectId, sprints, onUpdate }: SprintListProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editSprint, setEditSprint] = useState<Sprint | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [deleteSprint, { isLoading: isDeleting }] = useDeleteSprintMutation();

  const handleDelete = async () => {
    try {
      await deleteSprint(sprints[0]._id).unwrap();
      toast.success("Sprint deleted successfully!");
      onUpdate();
    } catch (err) {
      console.error("Delete sprint failed", err);
      toast.error("Failed to delete sprint!");
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const currentOrder = sprints.map((s) => s._id);
    const draggedIndex = currentOrder.indexOf(draggedId);
    const targetIndex = currentOrder.indexOf(targetId);

    currentOrder.splice(draggedIndex, 1);
    currentOrder.splice(targetIndex, 0, draggedId);

    reorderSprints(projectId, currentOrder);
    setDraggedId(null);
    onUpdate();
  };

  const getSprintStatus = (sprint: Sprint) => {
    const now = new Date();
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);

    if (now < start)
      return {
        label: "Upcoming",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      };
    if (now > end)
      return {
        label: "Completed",
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      };
    return {
      label: "Active",
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    };
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <CardTitle className="text-base sm:text-lg">
          Sprints / Milestones
        </CardTitle>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm"
        >
          <Plus className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Add Sprint
        </Button>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
        {sprints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No sprints yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first sprint to start planning
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {sprints.map((sprint) => {
              const status = getSprintStatus(sprint);
              return (
                <div
                  key={sprint._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, sprint._id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, sprint._id)}
                  className={`group flex items-center gap-2 sm:gap-3 rounded-lg border border-border bg-card p-3 sm:p-4 transition-all hover:border-primary/30 ${
                    draggedId === sprint._id ? "opacity-50" : ""
                  }`}
                >
                  <div className="cursor-grab text-muted-foreground hover:text-foreground hidden sm:block">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/10 text-xs sm:text-sm font-semibold text-primary shrink-0">
                    {sprint.sprintNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      <h4 className="font-medium text-foreground text-sm truncate">
                        {sprint.title}
                      </h4>
                      <Badge
                        className={`${status.color} text-[10px] sm:text-xs shrink-0`}
                      >
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs sm:text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                      <span className="truncate">
                        {new Date(sprint.startDate).toLocaleDateString()} -{" "}
                        {new Date(sprint.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 shrink-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Sprint actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditSprint(sprint)}>
                        Edit Sprint
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-destructive"
                      >
                        Delete Sprint
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <CreateSprintDialog
        projectId={projectId}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={onUpdate}
      />

      {editSprint && (
        <EditSprintDialog
          sprint={editSprint}
          open={!!editSprint}
          onOpenChange={(open) => !open && setEditSprint(null)}
          onUpdate={onUpdate}
        />
      )}
    </Card>
  );
}

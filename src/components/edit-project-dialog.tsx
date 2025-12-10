"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import type { Project, ProjectStatus } from "@/src/lib/types";
import { useUpdateProjectMutation } from "@/src/redux/features/projects/projectApi";

interface EditProjectDialogProps {
  project: Project; // optional
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

type FormData = {
  title: string;
  client: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: ProjectStatus;
  totalTasks: number;
  completedTasks: number;
  thumbnail?: string;
};

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
  onUpdate,
}: EditProjectDialogProps) {
  const [updateProject, { isLoading }] = useUpdateProjectMutation();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      client: "",
      description: "",
      startDate: "",
      endDate: "",
      budget: 0,
      status: "planned",
      totalTasks: 0,
      completedTasks: 0,
      thumbnail: "",
    },
  });

  // Reset form when project changes OR dialog opens
  useEffect(() => {
    if (open && project) {
      reset({
        title: project.title || "",
        client: project.client || "",
        description: project.description || "",
        startDate: project.startDate || "",
        endDate: project.endDate || "",
        budget: project.budget || 0,
        status: project.status || "planned",
        totalTasks: project.totalTasks || 0,
        completedTasks: project.completedTasks || 0,
        thumbnail: project.thumbnail || "",
      });
    }
  }, [project, open, reset]);

  const onSubmit = async (data: FormData) => {
    console.log("update data for :>> ", data);
    const projectId = project?._id;
    console.log("Submitting project:", projectId);

    if (!project?._id) {
      console.error("Project id is missing!");
      return;
    }

    try {
      await updateProject({ projectId, data }).unwrap();
      onOpenChange(false);
    } catch (err) {
      console.error("Update project failed", err);
    }
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update project details and information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                {...register("client", { required: "Client is required" })}
              />
              {errors.client && (
                <p className="text-red-500 text-sm">{errors.client.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate", { required: true })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate", { required: true })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  {...register("budget", { valueAsNumber: true })}
                  min={0}
                />
              </div>

              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => field.onChange(val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="totalTasks">Total Tasks</Label>
                <Input
                  id="totalTasks"
                  type="number"
                  {...register("totalTasks", { valueAsNumber: true })}
                  min={0}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="completedTasks">Completed Tasks</Label>
                <Input
                  id="completedTasks"
                  type="number"
                  {...register("completedTasks", { valueAsNumber: true })}
                  min={0}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
              <Input
                id="thumbnail"
                {...register("thumbnail")}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

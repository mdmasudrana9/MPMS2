"use client";

import { useForm } from "react-hook-form";
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

import { addProject } from "@/src/lib/project-store";
import type { ProjectStatus } from "@/src/lib/types";
import { useCreateProjectMutation } from "@/src/redux/features/projects/projectApi";
import { toast } from "sonner";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormValues = {
  title: string;
  client: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: string;
  status: ProjectStatus;
  thumbnail: string;
};

export function CreateProjectDialog({
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const [createProject, { isLoading, isSuccess, isError }] =
    useCreateProjectMutation();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      client: "",
      description: "",
      startDate: "",
      endDate: "",
      budget: "",
      status: "planned",
      thumbnail: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("create-data :>> ", data);
    createProject({
      ...data,
      budget: Number(data.budget) || 0,
      totalTasks: 0,
      completedTasks: 0,
    });
    // addProject({
    //   ...data,
    //   budget: Number(data.budget) || 0,
    //   totalTasks: 0,
    //   completedTasks: 0,
    // });

    reset();
    onOpenChange(false);
    toast.success("Project created successfully!");
    // window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to your portfolio. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label>Project Title</Label>
              <Input
                placeholder="Enter project title"
                {...register("title", { required: true })}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">Title is required</p>
              )}
            </div>

            {/* Client */}
            <div className="grid gap-2">
              <Label>Client</Label>
              <Input
                placeholder="Enter client name"
                {...register("client", { required: true })}
              />
              {errors.client && (
                <p className="text-red-500 text-sm">Client is required</p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Enter project description"
                rows={3}
                {...register("description")}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  {...register("startDate", { required: true })}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm">Start date is required</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  {...register("endDate", { required: true })}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm">End date is required</p>
                )}
              </div>
            </div>

            {/* Budget + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Budget ($)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  {...register("budget")}
                />
              </div>

              {/* STATUS - React Hook Form + ShadCN select */}
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  onValueChange={(v) => setValue("status", v as ProjectStatus)}
                  value={watch("status")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="grid gap-2">
              <Label>Thumbnail URL (optional)</Label>
              <Input
                placeholder="https://example.com/image.jpg"
                {...register("thumbnail")}
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

            <Button type="submit">Create Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

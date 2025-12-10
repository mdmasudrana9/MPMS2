"use client";

import type React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

import type { Sprint } from "@/src/lib/types";
import { useUpdateSprintMutation } from "@/src/redux/features/sprint/sprintApi";

interface EditSprintDialogProps {
  sprint: Sprint;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

type FormData = {
  title: string;
  startDate: string;
  endDate: string;
};

export function EditSprintDialog({
  sprint,
  open,
  onOpenChange,
  onUpdate,
}: EditSprintDialogProps) {
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      title: sprint.title,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
    },
  });

  const [updateSprint, { isLoading }] = useUpdateSprintMutation();

  // Whenever sprint changes, reset form values
  useEffect(() => {
    reset({
      title: sprint.title,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
    });
  }, [sprint, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await updateSprint({ sprintId: sprint._id, data }).unwrap();
      onOpenChange(false);
      onUpdate();
    } catch (err) {
      console.error("Failed to update sprint:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Sprint</DialogTitle>
          <DialogDescription>Update the sprint details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register("title", { required: true })}
                placeholder="e.g., Discovery Phase"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  {...register("startDate", { required: true })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  {...register("endDate", { required: true })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

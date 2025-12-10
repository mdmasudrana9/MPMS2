"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Plus, X } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import type {
  Sprint,
  TaskStatus,
  TaskPriority,
  Subtask,
  Project,
} from "@/src/lib/types";

import { useCreateTaskMutation } from "@/src/redux/features/task/taskApi";
import { toast } from "sonner";
import { useGetAllUserQuery } from "@/src/redux/features/auth/authApi";

interface CreateTaskDialogProps {
  projectId: string;
  sprints: Sprint[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // onCreate: () => void;
  projects?: Project[];
  onProjectChange?: (projectId: string) => void;
}

type FormValues = {
  title: string;
  description: string;
  projectId: string;
  sprintId: string;
  assignees: string[];
  estimate: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  subtasks: Subtask[];
};

export function CreateTaskDialog({
  projectId,
  sprints,
  open,
  onOpenChange,
}: CreateTaskDialogProps) {
  const [assigneeInput, setAssigneeInput] = useState("");
  const [subtaskInput, setSubtaskInput] = useState("");
  const [assignees, setAssignees] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const { data } = useGetAllUserQuery("");
  const members = data?.data?.members || [];
  // const admins = data?.data?.admins;

  console.log("members :>> ", members);

  const existingAssignees = members.map((member: any) => member._id);

  console.log(existingAssignees);

  const { control, handleSubmit, reset, watch, setValue } = useForm<FormValues>(
    {
      defaultValues: {
        title: "",
        description: "",
        projectId,
        sprintId: "",
        assignees: [],
        estimate: "4",
        priority: "medium",
        status: "todo",
        dueDate: "",
        subtasks: [],
      },
    }
  );

  const [createTask, { isLoading }] = useCreateTaskMutation();

  // ✅ Auto-select first sprint only once
  useEffect(() => {
    if (sprints.length > 0) {
      setValue("sprintId", sprints[0]._id, { shouldDirty: false });
    }
  }, [sprints, setValue]);

  // ✅ Always keep projectId synced
  useEffect(() => {
    if (sprints.length > 0) {
      setValue("sprintId", sprints[0]._id, { shouldDirty: false });
    }
  }, [sprints, setValue]);

  const handleAddAssignee = () => {
    const trimmed = assigneeInput.trim();
    if (trimmed && !assignees.includes(trimmed)) {
      const newAssignees = [...assignees, trimmed];
      setAssignees(newAssignees);
      setValue("assignees", newAssignees);
      setAssigneeInput("");
    }
  };

  const handleRemoveAssignee = (a: string) => {
    const updated = assignees.filter((x) => x !== a);
    setAssignees(updated);
    setValue("assignees", updated);
  };

  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      const updated = [
        ...subtasks,
        {
          id: Date.now().toString(),
          title: subtaskInput.trim(),
          completed: false,
        },
      ];
      setSubtasks(updated);
      setValue("subtasks", updated);
      setSubtaskInput("");
    }
  };

  const handleRemoveSubtask = (id: string) => {
    const updated = subtasks.filter((s) => s.id !== id);
    setSubtasks(updated);
    setValue("subtasks", updated);
  };

  const onSubmit = async (data: FormValues) => {
    console.log("Task Data:", data);

    try {
      await createTask({
        ...data,
        estimate: Number(data.estimate),
      }).unwrap();

      toast.success("Task created successfully!");
      // onCreate();
      onOpenChange(false);
      reset();
      setAssignees([]);
      setSubtasks([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create task");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label>Title</Label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter task title" />
              )}
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label>Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea {...field} placeholder="Enter task description" />
              )}
            />
          </div>

          {/* Sprint & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Sprint</Label>
              <Controller
                name="sprintId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v)}
                    disabled={sprints.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sprint" />
                    </SelectTrigger>
                    <SelectContent>
                      {sprints.map((s) => (
                        <SelectItem key={s._id} value={s._id}>
                          Sprint {s.sprintNumber}: {s.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid gap-2">
              <Label>Due Date</Label>
              <Controller
                name="dueDate"
                control={control}
                render={({ field }) => <Input {...field} type="date" />}
              />
            </div>
          </div>

          {/* Estimate / Priority / Status */}
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Estimate (hours)</Label>
              <Controller
                name="estimate"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="number" min="0" />
                )}
              />
            </div>

            <div className="grid gap-2">
              <Label>Priority</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* this is start  */}
          <div className="grid gap-2">
            <Label>Assignees</Label>

            <div className="flex gap-2">
              <Controller
                name="assignees"
                control={control}
                render={({ field }) => (
                  <Select
                    value={assigneeInput}
                    onValueChange={(value) => setAssigneeInput(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingAssignees.map((name: any) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (assigneeInput && !assignees.includes(assigneeInput)) {
                    const newAssignees = [...assignees, assigneeInput];
                    setAssignees(newAssignees);
                    setValue("assignees", newAssignees);
                    setAssigneeInput("");
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {assignees.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                >
                  {a}
                  <button type="button" onClick={() => handleRemoveAssignee(a)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* this is end  */}

          {/* Subtasks */}
          <div className="grid gap-2">
            <Label>Subtasks (optional)</Label>
            <div className="flex gap-2">
              <Input
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                placeholder="Add subtask"
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddSubtask())
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSubtask}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 mt-2">
              {subtasks.map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between bg-muted/50 p-2 rounded-lg"
                >
                  <span>{s.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(s.id)}
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={
              isLoading ||
              !watch("title") ||
              !watch("sprintId") ||
              !watch("dueDate") ||
              !watch("projectId")
            }
          >
            {isLoading ? "Creating..." : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

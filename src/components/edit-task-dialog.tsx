"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Checkbox } from "@/src/components/ui/checkbox";
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
  Task,
  Sprint,
  TaskPriority,
  TaskStatus,
  Subtask,
} from "@/src/lib/types";
import { useUpdateTaskMutation } from "@/src/redux/features/task/taskApi";
import { useGetAllUserQuery } from "@/src/redux/features/auth/authApi"; // <--- Add this import
import { toast } from "sonner";

interface EditTaskDialogProps {
  task: Task;
  sprints: Sprint[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

// User data type based on assumed query response structure
type UserData = {
  _id: string;
  name: string;
};

// Form value type for better type safety
type FormValues = {
  title: string;
  description: string;
  sprintId: string;
  assignees: string[]; // This will now hold user IDs (MongoDB ObjectId strings)
  estimate: string; // Stored as string in form, converted to number on submit
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  subtasks: Subtask[];
  assigneeSelectInput: string; // Temporary state for select input
  subtaskInput: string;
};

export function EditTaskDialog({
  task,
  sprints,
  open,
  onOpenChange,
  onUpdate,
}: EditTaskDialogProps) {
  const { data: userData } = useGetAllUserQuery("");
  const allUsers: UserData[] = useMemo(() => {
    if (userData?.data) {
      // Combine members and admins, ensuring they have _id and name
      return [
        ...(userData.data.members || []),
        ...(userData.data.admins || []),
      ].filter((user) => user._id && user.name);
    }
    return [];
  }, [userData]);

  const { control, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      title: task.title,
      description: task.description,
      sprintId: task.sprintId,
      assignees: task.assignees || [],
      estimate: task.estimate.toString(),
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate.split("T")[0], // Format date for input type="date"
      subtasks: task.subtasks || [],
      assigneeSelectInput: "", // Initialize temp select input
      subtaskInput: "",
    },
  });

  const [updateTask, { isLoading }] = useUpdateTaskMutation();

  const assignees = watch("assignees");
  const subtasks = watch("subtasks");
  const assigneeSelectInput = watch("assigneeSelectInput");
  const subtaskInput = watch("subtaskInput");

  // Reset/Set form values when task prop changes
  useEffect(() => {
    setValue("title", task.title);
    setValue("description", task.description);
    setValue("sprintId", task.sprintId);
    setValue("assignees", task.assignees || []);
    setValue("estimate", task.estimate.toString());
    setValue("priority", task.priority);
    setValue("status", task.status);
    setValue("dueDate", task.dueDate.split("T")[0]); // Re-format date
    setValue("subtasks", task.subtasks || []);
  }, [task, setValue]);

  // Helper function to get user name from ID
  const getUserNameById = (id: string) => {
    return allUsers.find((user) => user._id === id)?.name || `ID: ${id}`;
  };

  // --- Assignee Handlers (Updated to use IDs from Select) ---

  const handleAddAssignee = (userId: string) => {
    if (userId && !assignees.includes(userId)) {
      const newAssignees = [...assignees, userId];
      setValue("assignees", newAssignees);
    }
    // Clear the temporary select input value after adding
    setValue("assigneeSelectInput", "");
  };

  const handleRemoveAssignee = (a: string) => {
    setValue(
      "assignees",
      assignees.filter((x) => x !== a)
    );
  };

  // --- Subtask Handlers (No change, retained for completeness) ---

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    setValue("subtasks", [
      ...subtasks,
      {
        id: Date.now().toString(),
        title: subtaskInput.trim(),
        completed: false,
      },
    ]);
    setValue("subtaskInput", "");
  };

  const handleRemoveSubtask = (id: string) => {
    setValue(
      "subtasks",
      subtasks.filter((s) => s.id !== id)
    );
  };

  const handleToggleSubtask = (id: string) => {
    setValue(
      "subtasks",
      subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await updateTask({
        taskId: task._id,
        data: {
          ...data,
          estimate: Number(data.estimate),
          // Ensure subtaskInput and assigneeSelectInput are removed before sending
          assigneeSelectInput: undefined,
          subtaskInput: undefined,
        },
      }).unwrap();
      toast.success("Task updated successfully!");
      onUpdate?.(); // Use optional chaining for onUpdate
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to update task. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input {...field} id="title" placeholder="Enter task title" />
              )}
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="description"
                  rows={3}
                  placeholder="Enter task description"
                />
              )}
            />
          </div>

          {/* Sprint & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="sprintId">Sprint</Label>
              <Controller
                name="sprintId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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
              <Label htmlFor="dueDate">Due Date</Label>
              <Controller
                name="dueDate"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="date" id="dueDate" />
                )}
              />
            </div>
          </div>

          {/* Estimate / Priority / Status */}
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="estimate">Estimate (hours)</Label>
              <Controller
                name="estimate"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="number" min="0" />
                )}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
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
              <Label htmlFor="status">Status</Label>
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

          {/* Assignees (Updated to use Select for IDs) */}
          <div className="grid gap-2">
            <Label>Assignees (Select ID to Add)</Label>
            <div className="flex gap-2">
              <Controller
                name="assigneeSelectInput"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      // setValue("assigneeSelectInput", value); // React Hook Form handles this
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user ID to assign" />
                    </SelectTrigger>
                    <SelectContent>
                      {allUsers.map(
                        (user) =>
                          // Check if user is already assigned before listing
                          !assignees.includes(user._id) && (
                            <SelectItem key={user._id} value={user._id}>
                              {user.name} (ID: {user._id.slice(0, 4)}...)
                            </SelectItem>
                          )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddAssignee(assigneeSelectInput)}
                disabled={
                  !assigneeSelectInput ||
                  assignees.includes(assigneeSelectInput)
                }
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Display Assigned Users */}
            {assignees.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {assignees.map((a: string) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                  >
                    {getUserNameById(a)} {/* Display Name here */}
                    <button
                      type="button"
                      onClick={() => handleRemoveAssignee(a)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Subtasks */}
          <div className="grid gap-2">
            <Label>Subtasks</Label>
            <div className="flex gap-2">
              <Controller
                name="subtaskInput"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Add subtask"
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddSubtask())
                    }
                  />
                )}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSubtask}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {subtasks.length > 0 && (
              <div className="space-y-2 mt-2">
                {subtasks.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm"
                  >
                    <Checkbox
                      checked={s.completed}
                      onCheckedChange={() => handleToggleSubtask(s.id)}
                    />
                    <span
                      className={
                        s.completed ? "line-through text-muted-foreground" : ""
                      }
                    >
                      {s.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(s.id)}
                      className="ml-auto text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
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

"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Badge } from "@/src/components/ui/badge";
import type { TeamMember, MemberStatus, TeamRole } from "@/src/lib/types";
import { useCreateTeamMemberMutation } from "@/src/redux/features/team/teamApi";

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users?: any[];
}

type FormValues = {
  userId: string;
  name: string;
  email: string;
  role: TeamRole;
  department: string;
  skills: string[];
};

export function AddTeamMemberDialog({
  open,
  onOpenChange,
  users = [],
}: AddTeamMemberDialogProps) {
  const [createTeamMember] = useCreateTeamMemberMutation();
  const [skillInput, setSkillInput] = useState("");

  const { control, handleSubmit, setValue, watch, reset } = useForm<FormValues>(
    {
      defaultValues: {
        userId: "",
        name: "",
        email: "",
        role: "member",
        department: "",
        skills: [],
      },
    }
  );

  const selectedUserId = watch("userId");
  const skills = watch("skills");

  const departments = ["Engineering", "Design", "Marketing", "Sales"];
  const roles: TeamRole[] = ["admin", "manager", "member"];

  useEffect(() => {
    if (selectedUserId) {
      const user = users.find(
        (u) => u._id === selectedUserId || u.id === selectedUserId
      );
      if (user) {
        setValue("name", user.name || "");
        setValue("email", user.email || "");
        setValue("role", user.role || "member");
        setValue("department", user.department || "");
        setValue("skills", user.skills || []);
      }
    }
  }, [selectedUserId, users, setValue]);

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setValue("skills", [...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setValue(
      "skills",
      skills.filter((s) => s !== skill)
    );
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await createTeamMember(data).unwrap();
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create member:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>

        <form className="grid gap-4 py-4" onSubmit={handleSubmit(onSubmit)}>
          {/* User Dropdown */}
          <Controller
            name="userId"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem
                      key={user._id || user.id}
                      value={user._id || user.id}
                    >
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {/* Name Input */}
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input placeholder="Name" {...field} />}
          />

          {/* Email Input */}
          <Controller
            name="email"
            control={control}
            render={({ field }) => <Input placeholder="Email" {...field} />}
          />

          {/* Role Select */}
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {/* Department Select */}
          <Controller
            name="department"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dep) => (
                    <SelectItem key={dep} value={dep}>
                      {dep}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {/* Skills Input */}
          <div>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button type="button" onClick={handleAddSkill}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => handleRemoveSkill(skill)}
                >
                  {skill} ×
                </Badge>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Add Member</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

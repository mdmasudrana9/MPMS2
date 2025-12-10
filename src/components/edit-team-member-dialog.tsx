"use client";

import { useState, useEffect } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Badge } from "@/src/components/ui/badge";
import type { TeamMember, TeamRole, MemberStatus } from "@/src/lib/types";
import {
  updateTeamMember,
  getAllDepartments,
  getAllSkills,
} from "@/src/lib/team-store";

interface EditTeamMemberDialogProps {
  member: TeamMember;
  onMemberUpdated: (member: TeamMember) => void;
}

const defaultDepartments = [
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "Operations",
  "HR",
];
const defaultSkills = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "UI/UX",
  "Figma",
  "Project Management",
  "Agile",
  "Leadership",
  "Communication",
];

export function EditTeamMemberDialog({
  member,
  onMemberUpdated,
}: EditTeamMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [role, setRole] = useState<TeamRole>(member.role);
  const [department, setDepartment] = useState(member.department);
  const [customDepartment, setCustomDepartment] = useState("");
  const [skills, setSkills] = useState<string[]>(member.skills);
  const [customSkill, setCustomSkill] = useState("");
  const [status, setStatus] = useState<MemberStatus>(member.status);
  const [phone, setPhone] = useState(member.phone || "");

  const existingDepartments = getAllDepartments();
  const existingSkills = getAllSkills();
  const allDepartments = [
    ...new Set([...defaultDepartments, ...existingDepartments]),
  ];
  const allSkills = [...new Set([...defaultSkills, ...existingSkills])];

  useEffect(() => {
    if (open) {
      setName(member.name);
      setEmail(member.email);
      setRole(member.role);
      setDepartment(member.department);
      setSkills(member.skills);
      setStatus(member.status);
      setPhone(member.phone || "");
    }
  }, [open, member]);

  const handleAddSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setCustomSkill("");
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = () => {
    if (!name || !email) return;

    const finalDepartment =
      department === "custom" ? customDepartment : department;

    const updated = updateTeamMember(member.id, {
      name,
      email,
      role,
      department: finalDepartment || member.department,
      skills,
      status,
      phone: phone || undefined,
    });

    if (updated) {
      onMemberUpdated(updated);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as TeamRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as MemberStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="away">Away</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-department">Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
                <SelectItem value="custom">+ Add Custom</SelectItem>
              </SelectContent>
            </Select>
            {department === "custom" && (
              <Input
                placeholder="Enter department name"
                value={customDepartment}
                onChange={(e) => setCustomDepartment(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1">
                  {skill}
                  <button onClick={() => handleRemoveSkill(skill)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Select onValueChange={handleAddSkill}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add skill" />
                </SelectTrigger>
                <SelectContent>
                  {allSkills
                    .filter((s) => !skills.includes(s))
                    .map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                <Input
                  placeholder="Custom skill"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleAddSkill(customSkill)
                  }
                  className="w-32"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleAddSkill(customSkill)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-phone">Phone (optional)</Label>
            <Input
              id="edit-phone"
              placeholder="+1 234 567 890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!name || !email}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

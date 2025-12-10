"use client";

import { useState, useEffect } from "react";
import { Users, Mail, Trash2, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import type { TeamMember, MemberStatus } from "@/src/lib/types";

import { AddTeamMemberDialog } from "@/src/components/add-team-member-dialog";
import { EditTeamMemberDialog } from "@/src/components/edit-team-member-dialog";

import { useGetAllUserQuery } from "@/src/redux/features/auth/authApi";
import {
  useGetAllTeamMembersQuery,
  useDeleteTeamMemberMutation,
} from "@/src/redux/features/team/teamApi";
import { toast } from "sonner";

const statusColors: Record<MemberStatus, string> = {
  active: "bg-emerald-500",
  away: "bg-amber-500",
  offline: "bg-zinc-400",
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: usersData } = useGetAllUserQuery("");
  const allUsers = usersData?.data || { members: [], admins: [] };

  const { data: teamData, isLoading } = useGetAllTeamMembersQuery("");
  const [deleteTeamMember, { isLoading: deleteLoading }] =
    useDeleteTeamMemberMutation();
  const allTeamData = teamData?.data || [];

  useEffect(() => {
    if (
      allTeamData &&
      JSON.stringify(allTeamData) !== JSON.stringify(members)
    ) {
      setMembers(allTeamData);
    }
  }, [allTeamData, members]);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.skills.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteMember = async (id: string) => {
    try {
      // Toast Loading
      const loadingToast = toast.loading("Deleting team member...");

      const res = await deleteTeamMember(id).unwrap();

      toast.dismiss(loadingToast);

      // Success toast
      toast.success(res?.message || "Team member deleted successfully!");
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to delete team member. Try again!"
      );
    }
  };

  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === "active").length,
    away: members.filter((m) => m.status === "away").length,
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="px-4 py-4 md:px-6 md:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Team</h1>
              <p className="text-sm text-muted-foreground">
                Manage your team members
              </p>
            </div>

            <Button onClick={() => setDialogOpen(true)}>Add Team Member</Button>

            <AddTeamMemberDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              users={[...allUsers.members, ...allUsers.admins]}
            />
          </div>
        </div>
      </header>

      <div className="px-4 py-4 md:px-6 md:py-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Total Members</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Departments</p>
              <p className="text-xl font-bold text-purple-600">
                {
                  [...new Set(members.map((m) => m.department).filter(Boolean))]
                    .length
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="md:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="away">Away</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading */}
        {isLoading && (
          <p className="text-center text-muted-foreground py-10">
            Loading team...
          </p>
        )}

        {/* Member List */}
        {!isLoading && filteredMembers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No team members found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <Card key={member._id} className="group">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <span
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${
                          statusColors[member.status]
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm truncate">
                          {member.name}
                        </CardTitle>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          {/* <EditTeamMemberDialog
                            member={member}
                            onMemberUpdated={handleMemberUpdated}
                          /> */}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Member
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {member.name}?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteMember(member._id)}
                                  className="bg-destructive"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Email */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{member.email}</span>
                  </div>

                  {/* Role + Department */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <Badge className="bg-blue-500/15 text-blue-600 px-2 py-0.5 text-xs rounded-md">
                      {member.role}
                    </Badge>

                    {member.department && (
                      <Badge className="bg-purple-500/15 text-purple-600 px-2 py-0.5 text-xs rounded-md">
                        {member.department}
                      </Badge>
                    )}
                  </div>

                  {/* Skills */}
                  {member.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {member.skills.slice(0, 4).map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-200"
                        >
                          {skill}
                        </Badge>
                      ))}

                      {member.skills.length > 4 && (
                        <Badge
                          variant="secondary"
                          className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-md"
                        >
                          +{member.skills.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

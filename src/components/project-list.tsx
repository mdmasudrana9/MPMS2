"use client";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import type { Project, ProjectStatus } from "@/src/lib/types";
import { useGetAllProjectsQuery } from "@/src/redux/features/projects/projectApi";
import { Grid3X3, List, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProjectCard } from "./project-card";
import { ProjectTable } from "./project-table";

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">(
    "all"
  );
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  // const [clients, setClients] = useState<string[]>([]);
  const { data, isLoading, isError } = useGetAllProjectsQuery("");

  console.log("Project API Response:", data?.data);

  useEffect(() => {
    if (data?.data) {
      setProjects(data.data);
      // setClients([...new Set(data?.data.map((p: any) => p.client))]);
    }
  }, [data]);

  const refreshProjects = () => {
    setProjects(data.data);
    // setClients(getUniqueClients());
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;
      const matchesClient =
        clientFilter === "all" || project.client === clientFilter;
      const matchesSearch =
        searchQuery === "" ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesClient && matchesSearch;
    });
  }, [projects, statusFilter, clientFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: projects.length,
      active: projects.filter((p) => p.status === "active").length,
      completed: projects.filter((p) => p.status === "completed").length,
      planned: projects.filter((p) => p.status === "planned").length,
    };
  }, [projects]);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load projects</p>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Projects</p>
          <p className="text-2xl font-semibold text-foreground">
            {stats.total}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-semibold text-emerald-500">
            {stats.active}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-semibold text-blue-500">
            {stats.completed}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Planned</p>
          <p className="text-2xl font-semibold text-amber-500">
            {stats.planned}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ProjectStatus | "all")}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          {/* <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client} value={client}>
                  {client}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setView("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
            <span className="sr-only">Grid view</span>
          </Button>
          <Button
            variant={view === "table" ? "default" : "outline"}
            size="icon"
            onClick={() => setView("table")}
          >
            <List className="h-4 w-4" />
            <span className="sr-only">Table view</span>
          </Button>
        </div>
      </div>

      {/* Project List */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <p className="text-lg font-medium text-foreground">
            No projects found
          </p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or create a new project
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onUpdate={refreshProjects}
            />
          ))}
        </div>
      ) : (
        <ProjectTable projects={filteredProjects} onUpdate={refreshProjects} />
      )}
    </div>
  );
}

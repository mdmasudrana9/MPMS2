import type { Project } from "./types";

const STORAGE_KEY = "projects";

const initialProjects: Project[] = [
  {
    _id: "1",
    title: "E-commerce Platform Redesign",
    client: "TechCorp Inc.",
    description:
      "Complete redesign of the e-commerce platform with modern UI/UX",
    startDate: "2024-01-15",
    endDate: "2024-06-30",
    budget: 75000,
    status: "active",
    thumbnail: "/ecommerce-website-design.png",
    totalTasks: 24,
    completedTasks: 18,
    createdAt: "2024-01-10",
  },
  {
    _id: "2",
    title: "Mobile App Development",
    client: "StartupXYZ",
    description: "Native iOS and Andro_id app for fitness tracking",
    startDate: "2024-02-01",
    endDate: "2024-08-15",
    budget: 120000,
    status: "active",
    thumbnail: "/mobile-app-fitness.jpg",
    totalTasks: 36,
    completedTasks: 12,
    createdAt: "2024-01-25",
  },
  {
    _id: "3",
    title: "Brand _identity Package",
    client: "GreenLeaf Co.",
    description:
      "Complete brand _identity including logo, gu_idelines, and collateral",
    startDate: "2023-11-01",
    endDate: "2024-01-31",
    budget: 25000,
    status: "completed",
    thumbnail: "/brand-_identity-design.png",
    totalTasks: 12,
    completedTasks: 12,
    createdAt: "2023-10-20",
  },
  {
    _id: "4",
    title: "Data Analytics Dashboard",
    client: "FinanceHub",
    description:
      "Real-time analytics dashboard for financial data visualization",
    startDate: "2024-04-01",
    endDate: "2024-09-30",
    budget: 95000,
    status: "planned",
    thumbnail: "/analytics-dashboard-dark.jpg",
    totalTasks: 28,
    completedTasks: 0,
    createdAt: "2024-03-15",
  },
  {
    _id: "5",
    title: "Legacy System Migration",
    client: "RetailMax",
    description: "Migration from legacy systems to cloud-based infrastructure",
    startDate: "2023-06-01",
    endDate: "2023-12-31",
    budget: 150000,
    status: "archived",
    thumbnail: "/cloud-migration-server.jpg",
    totalTasks: 45,
    completedTasks: 45,
    createdAt: "2023-05-10",
  },
];

export function getProjects(): Project[] {
  if (typeof window === "undefined") return initialProjects;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProjects));
    return initialProjects;
  }
  return JSON.parse(stored);
}

export function getProject(_id: string): Project | undefined {
  const projects = getProjects();
  return projects.find((p) => p._id === _id);
}

export function saveProjects(projects: Project[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function addProject(
  project: Omit<Project, "_id" | "createdAt">
): Project {
  const projects = getProjects();
  const newProject: Project = {
    ...project,
    _id: Date.now().toString(),
    createdAt: new Date().toISOString().split("T")[0],
  };
  saveProjects([newProject, ...projects]);
  return newProject;
}

export function updateProject(
  _id: string,
  updates: Partial<Project>
): Project | undefined {
  const projects = getProjects();
  const index = projects.findIndex((p) => p._id === _id);
  if (index === -1) return undefined;
  projects[index] = { ...projects[index], ...updates };
  saveProjects(projects);
  return projects[index];
}

export function deleteProject(_id: string): boolean {
  const projects = getProjects();
  const filtered = projects.filter((p) => p._id !== _id);
  if (filtered.length === projects.length) return false;
  saveProjects(filtered);
  return true;
}

export function getUniqueClients(): string[] {
  const projects = getProjects();
  return [...new Set(projects.map((p) => p.client))];
}

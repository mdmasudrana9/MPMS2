export type ProjectStatus = "planned" | "active" | "completed" | "archived";

export type TaskStatus = "todo" | "in-progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: "pdf" | "image";
}

export interface Task {
  _id: string;
  projectId: string;
  sprintId: string;
  title: string;
  description: string;
  assignees: string[];
  estimate: number; // hours
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  attachments: Attachment[];
  subtasks: Subtask[];
  createdAt: string;
}

export interface Sprint {
  _id: string;
  projectId: string;
  title: string;
  sprintNumber: number;
  startDate: string;
  endDate: string;
  order: number;
  createdAt: string;
}

export interface Project {
  _id: string;
  title: string;
  client: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: ProjectStatus;
  thumbnail?: string;
  totalTasks: number;
  completedTasks: number;
  createdAt: string;
}

export type TeamRole = "admin" | "manager" | "member";
export type MemberStatus = "active" | "away" | "offline";

export interface TeamMember {
  _id: string;
  name: string;
  email: string;
  department?: string;
  skills: string[];
  status: MemberStatus;
  createdAt?: string;
  role?: string;
  phone?: string;
}

export type RegisterFormValues = {
  name: string;
  id: string;
  email: string;
  department: string;
  password: string;
  confirmPassword: string;
};

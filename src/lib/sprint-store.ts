import type { Sprint } from "./types";

const SPRINTS_STORAGE_KEY = "sprints";

const initialSprints: Sprint[] = [
  {
    _id: "s1",
    projectId: "1",
    title: "Discovery & Planning",
    sprintNumber: 1,
    startDate: "2024-01-15",
    endDate: "2024-02-14",
    order: 0,
    createdAt: "2024-01-10",
  },
  {
    _id: "s2",
    projectId: "1",
    title: "UI/UX Design Phase",
    sprintNumber: 2,
    startDate: "2024-02-15",
    endDate: "2024-03-31",
    order: 1,
    createdAt: "2024-01-10",
  },
  {
    _id: "s3",
    projectId: "1",
    title: "Frontend Development",
    sprintNumber: 3,
    startDate: "2024-04-01",
    endDate: "2024-05-15",
    order: 2,
    createdAt: "2024-01-10",
  },
  {
    _id: "s4",
    projectId: "2",
    title: "Requirements Gathering",
    sprintNumber: 1,
    startDate: "2024-02-01",
    endDate: "2024-02-28",
    order: 0,
    createdAt: "2024-01-25",
  },
  {
    _id: "s5",
    projectId: "2",
    title: "Core App Development",
    sprintNumber: 2,
    startDate: "2024-03-01",
    endDate: "2024-05-15",
    order: 1,
    createdAt: "2024-01-25",
  },
];

export function getSprints(): Sprint[] {
  if (typeof window === "undefined") return initialSprints;
  const stored = localStorage.getItem(SPRINTS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(SPRINTS_STORAGE_KEY, JSON.stringify(initialSprints));
    return initialSprints;
  }
  return JSON.parse(stored);
}

export function getSprintsByProject(projectId: string): Sprint[] {
  const sprints = getSprints();
  return sprints
    .filter((s) => s.projectId === projectId)
    .sort((a, b) => a.order - b.order);
}

export function getSprint(id: string): Sprint | undefined {
  const sprints = getSprints();
  return sprints.find((s) => s._id === id);
}

export function saveSprints(sprints: Sprint[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SPRINTS_STORAGE_KEY, JSON.stringify(sprints));
}

export function getNextSprintNumber(projectId: string): number {
  const projectSprints = getSprintsByProject(projectId);
  if (projectSprints.length === 0) return 1;
  return Math.max(...projectSprints.map((s) => s.sprintNumber)) + 1;
}

export function addSprint(
  sprint: Omit<Sprint, "id" | "createdAt" | "sprintNumber" | "order">
): Sprint {
  const sprints = getSprints();
  const projectSprints = sprints.filter(
    (s) => s.projectId === sprint.projectId
  );
  const newSprint: Sprint = {
    ...sprint,
    _id: Date.now().toString(),
    sprintNumber: getNextSprintNumber(sprint.projectId),
    order: projectSprints.length,
    createdAt: new Date().toISOString().split("T")[0],
  };
  saveSprints([...sprints, newSprint]);
  return newSprint;
}

export function updateSprint(
  id: string,
  updates: Partial<Sprint>
): Sprint | undefined {
  const sprints = getSprints();
  const index = sprints.findIndex((s) => s._id === id);
  if (index === -1) return undefined;
  sprints[index] = { ...sprints[index], ...updates };
  saveSprints(sprints);
  return sprints[index];
}

export function deleteSprint(id: string): boolean {
  const sprints = getSprints();
  const sprintToDelete = sprints.find((s) => s._id === id);
  if (!sprintToDelete) return false;

  const filtered = sprints.filter((s) => s._id !== id);

  // Reorder remaining sprints for the same project
  const projectSprints = filtered
    .filter((s) => s.projectId === sprintToDelete.projectId)
    .sort((a, b) => a.order - b.order);

  projectSprints.forEach((sprint, index) => {
    sprint.order = index;
    sprint.sprintNumber = index + 1;
  });

  saveSprints(filtered);
  return true;
}

export function reorderSprints(projectId: string, sprintIds: string[]): void {
  const sprints = getSprints();
  const otherSprints = sprints.filter((s) => s.projectId !== projectId);
  const projectSprints = sprints.filter((s) => s.projectId === projectId);

  const reorderedSprints = sprintIds
    .map((id, index) => {
      const sprint = projectSprints.find((s) => s._id === id);
      if (sprint) {
        return { ...sprint, order: index, sprintNumber: index + 1 };
      }
      return null;
    })
    .filter(Boolean) as Sprint[];

  saveSprints([...otherSprints, ...reorderedSprints]);
}

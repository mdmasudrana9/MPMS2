import { ProjectList } from "@/src/components/project-list";
import { ProjectHeader } from "@/src/components/project-header";

export default function ProjectsPage() {
  return (
    <>
      <ProjectHeader />
      <div className="px-4 py-4 md:px-6 md:py-6">
        <ProjectList />
      </div>
    </>
  );
}

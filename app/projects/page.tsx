import { Suspense } from "react";
import { ProjectsBrowser } from "../../components/features/projects/ProjectsBrowser";
import { projects } from "../../lib/projects/catalog";

export default function Projects() {
  return (
    <main className="page projects-page">
      <Suspense fallback={<div className="projects-loading">loading projects</div>}>
        <ProjectsBrowser projects={projects} />
      </Suspense>
    </main>
  );
}

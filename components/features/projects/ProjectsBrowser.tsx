"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import type { CSSProperties } from "react";
import type { ProjectAction, ProjectEntry } from "../../../lib/projects/catalog";

type ProjectsBrowserProps = {
  projects: ProjectEntry[];
};

const actionIcons: Record<ProjectAction["kind"], string> = {
  play: "/icons/action-play.svg",
  site: "/icons/action-external.svg",
  repo: "/social/github.svg",
  gamebanana: "/images/projects/gamebanana-today-icon.png",
  download: "/icons/action-download.svg",
  docs: "/icons/action-docs.svg",
  external: "/icons/action-external.svg"
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function isExternalHref(href: string) {
  return /^https?:\/\//.test(href);
}

export function ProjectsBrowser({ projects }: ProjectsBrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedSlug = searchParams.get("project");

  const selectedProject = projects.find((project) => project.slug === selectedSlug);
  const selectedSlugMissing = Boolean(selectedSlug && !selectedProject);

  const makeHref = useCallback(
    (next: { project?: string | null }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.project === null) {
        params.delete("project");
      } else if (next.project) {
        params.set("project", next.project);
      }

      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams]
  );

  const openProject = useCallback(
    (slug: string) => {
      router.push(makeHref({ project: slug }));
    },
    [makeHref, router]
  );

  const closeProject = useCallback(() => {
    router.push(makeHref({ project: null }));
  }, [makeHref, router]);

  useEffect(() => {
    if (!selectedProject) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeProject();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeProject, selectedProject]);

  return (
    <section className="projects-section" aria-labelledby="projects-title">
      <div className="projects-header">
        <div>
          <h1 id="projects-title">projects</h1>
        </div>
      </div>

      {selectedSlugMissing ? (
        <div className="project-empty" role="status">
          <p>Project not found.</p>
          <button onClick={closeProject} type="button">
            clear selection
          </button>
        </div>
      ) : null}

      <div className="projects-grid">
        {projects.map((project) => (
          <button
            className={`project-card${
              project.status === "obsolete" ? " project-card-obsolete" : ""
            }`}
            key={project.slug}
            onClick={() => openProject(project.slug)}
            style={{ "--project-accent": project.accent } as CSSProperties}
            type="button"
          >
            <ProjectMedia project={project} />
            <span className="project-card-body">
              <span className="project-card-heading">
                <ProjectIcon project={project} className="project-card-icon" />
                <span>
                  <span className="project-card-name">{project.name}</span>
                  <span className="project-card-type">{project.type}</span>
                </span>
              </span>
              {project.status === "obsolete" ? (
                <span className="project-obsolete-label">obsolete / discontinued</span>
              ) : null}
              <span className="project-card-description">{project.description}</span>
            </span>
          </button>
        ))}
      </div>

      {selectedProject ? (
        <ProjectPanel project={selectedProject} onClose={closeProject} />
      ) : null}
    </section>
  );
}

function ProjectMedia({ project }: { project: ProjectEntry }) {
  if (project.thumbnail) {
    return (
      <span className="project-card-media">
        <Image
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
          src={project.thumbnail}
        />
      </span>
    );
  }

  return (
    <span className="project-card-media project-card-media-fallback">
      {project.icon ? (
        <Image alt="" height={96} src={project.icon} unoptimized width={96} />
      ) : (
        <span>{getInitials(project.name)}</span>
      )}
    </span>
  );
}

function ProjectIcon({
  className,
  project
}: {
  className: string;
  project: ProjectEntry;
}) {
  return (
    <span className={className} aria-hidden="true">
      {project.icon ? (
        <Image alt="" height={48} src={project.icon} unoptimized width={48} />
      ) : (
        getInitials(project.name)
      )}
    </span>
  );
}

function ProjectPanel({
  onClose,
  project
}: {
  onClose: () => void;
  project: ProjectEntry;
}) {
  return (
    <>
      <button
        aria-label="Close project details"
        className="project-panel-backdrop"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-labelledby="project-panel-title"
        aria-modal="true"
        className={`project-panel${
          project.status === "obsolete" ? " project-panel-obsolete" : ""
        }`}
        role="dialog"
        style={{ "--project-accent": project.accent } as CSSProperties}
      >
        <div className="project-panel-scroll">
          <div className="project-panel-top">
            <ProjectIcon project={project} className="project-panel-icon" />
            <button
              aria-label="Close project details"
              className="project-close"
              onClick={onClose}
              type="button"
            >
              x
            </button>
          </div>

          <div className="project-panel-title-group">
            <p>
              {project.type}
              {project.status ? ` / ${project.status}` : ""}
            </p>
            <h2 id="project-panel-title">{project.name}</h2>
          </div>

          {project.status === "obsolete" ? (
            <div className="project-obsolete-notice" role="note">
              obsolete / discontinued
            </div>
          ) : null}

          <ProjectMedia project={project} />

          {project.details ? (
            <div className="project-panel-copy">
              <h3>details</h3>
              <p>{project.details}</p>
            </div>
          ) : null}

          <div className="project-actions" aria-label="Project actions">
            {project.actions.map((action) => (
              <a
                className={`project-action project-action-${action.kind}`}
                href={action.href}
                key={`${action.kind}-${action.href}`}
                rel={isExternalHref(action.href) ? "noreferrer" : undefined}
                target={isExternalHref(action.href) ? "_blank" : undefined}
              >
                <span aria-hidden="true">
                  <Image
                    alt=""
                    height={18}
                    src={actionIcons[action.kind]}
                    unoptimized
                    width={18}
                  />
                </span>
                {action.label}
              </a>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

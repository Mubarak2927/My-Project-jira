import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import { getAllProjects } from "../API/ProjectAPI";

const ProjectLayout = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const projects = await getAllProjects();

        const selectedProject = projects.find(
          (p) => String(p.id) === String(projectId)
        );

        setProject(selectedProject || null);
      } catch (err) {
        console.error("Failed to fetch project", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  /* 🔥 Loading */
  if (loading) {
    return (
      <div className="p-6 text-gray-500 animate-pulse">
        Loading project...
      </div>
    );
  }

  /* ❌ Not found */
  if (!project) {
    return (
      <div className="p-6 text-red-500">
        Project not found
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 🔥 PROJECT NAME */}
      <h1 className="text-2xl capitalize font-semibold mb-6">
        {project.name}
      </h1>

      {/* 🔥 Tabs */}
      <div className="flex gap-6 border-b mb-6">
        <Tab to="summary" label="Summary" />
        <Tab to="backlog" label="Product Backlog Items" />
        <Tab to="sprints" label="Sprints" />
        <Tab to="board" label="Board" />
        <Tab to="lists" label="Lists" />
        <Tab to="goals" label="Goals" />
      </div>

      {/* 🔥 Child Pages */}
      <Outlet context={{ project }} />
    </div>
  );
};

const Tab = ({ to, label }) => (
     <NavLink
      to={to}
      className={({ isActive }) =>
        `relative px-4 py-3 text-sm font-medium transition-colors
        ${
          isActive
            ? "text-blue-600"
            : "text-gray-500 hover:text-gray-800"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {label}

          <span
            className={`absolute left-0 -bottom-[1px] h-[2px] w-full rounded-full transition-all duration-300
            ${
              isActive
                ? "bg-blue-600 scale-x-100"
                : "bg-transparent scale-x-0 group-hover:scale-x-100"
            }`}
          />
        </>
      )}
    </NavLink>
);

export default ProjectLayout;

import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { getAllProjects, getProjectById } from "../API/projectAPI";
import { ChevronDown, ChevronUp, CircleArrowLeft, Fullscreen, List, ListFilter, Option } from "lucide-react";

const ProjectLayout = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate =useNavigate()

useEffect(() => {
  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await getProjectById(projectId); // ✅ ONLY ONE API
      setProject(data);
    } catch (err) {
      console.error("Failed to fetch project", err);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  fetchProject();
}, [projectId]);


  if (loading) {
    return (
      <div className="p-6 text-gray-500 animate-pulse">
        Loading project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-red-500">
        Project not found
      </div>
    );
  }

  return (
    <div className="p-6">
      <p className="flex gap-2 items-center  mb-5">
<CircleArrowLeft
onClick={() => navigate('/projects')}
 size={25} className="text-blue-600 hover:scale-110 cursor-pointer"/><span>Click to Back</span>
      </p>
      <h1 className="text-2xl capitalize font-semibold mb-6">
        {project.name}
      </h1>


  <div className="flex gap-6 border-b">
        <Tab to="summary" label="Summary" />
        <Tab to="backlog" label="Product Backlog Items" />
        <Tab to="sprints" label="Sprints" />
        <Tab to="board" label="Board" />
        <Tab to="lists" label="Lists" />
        <Tab to="goals" label="Goals" />
        <Tab to="completesprint" label="Completed Sprints" />
      </div>
      


     
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

import React, { useEffect, useState } from "react";
import {
  getAllProjects,
  deleteProject,
  createProject,
} from "../API/projectAPI";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import ProjectModal from "../Modal/ProjectModal";

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getAllProjects();
      setProjects(data);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ✅ CREATE PROJECT
  const handleCreateProject = async (formData, setLoading) => {
    try {
      setLoading(true);
      await createProject(formData);
      fetchProjects();
      toast.success("Project Created Successfully");
      setModalOpen(false);
      fetchProjects();
    } catch {
      toast.error("Create failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE PROJECT
  const handleDelete = async (e, projectId) => {
    e.stopPropagation();

    if (!window.confirm("Do you want Delete this project?")) return;

    try {
      await deleteProject(projectId);
      toast.success("Project Deleted Sucessfully");
      fetchProjects();
    } catch {
      toast.error("Delete failed");
    }
  };
  

  return (
    <div className="p-6 bg-gray-200 mt-5 rounded-xl">
        <Toaster position="top-right"/>
      {/* HEADER */}
      <div className="flex justify-between  items-center mb-6">
        <h1 className="text-2xl font-semibold text-black">
          Projects
        </h1>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600
          text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} /> Create Project
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="py-10 text-center text-gray-500">
          Loading projects...
        </div>
      )}

      {/* TABLE */}
      {!loading && (
        <div className="   border ">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-300">
              <tr className="">
                <th className="py-3 px-3 text-center ">SI NO</th>
                <th className="py-3 px-3 text-center ">Project Name</th>
                <th className="py-3 px-3 text-center ">Key</th>
                <th className="py-3 px-3 text-center ">Description</th>
                <th className="py-3 px-3 text-center ">Delete</th>
              </tr>
            </thead>

            <tbody>
              {projects.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-center   text-gray-500">
                    No projects found
                  </td>
                </tr>
              )}

              {projects.map((project, index) => (
                <tr
                  key={project.id}
                  className="border-t border-gray-800
                  hover:bg-[#262626] hover:text-white transition"
                >
                  <td className="py-3 text-center">{index + 1}</td>

                  <td
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="py-3 text-center font-medium
                    hover:underline cursor-pointer"
                  >
                    {project.name}
                  </td>

                  <td className="py-3 text-center">{project.key}</td>

                  <td className="py-3 text-center">
                    {project.description || "—"}
                  </td>

                  <td className="py-3 text-center">
                    <Trash2
                      size={16}
                      className="text-red-600 ml-6 cursor-pointer hover:scale-110"
                      onClick={(e) => handleDelete(e, project.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
       )} 

      {/* MODAL */}
      {modalOpen && (
        <ProjectModal
          setModalOpen={setModalOpen}
          onSubmit={handleCreateProject}
        />
      )}
    </div>
  );
};

export default ProjectManagement;

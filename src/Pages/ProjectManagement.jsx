import React, { useEffect, useState } from "react";
import {
  getAllProjects,
  deleteProject,
  createProject,
  updateProject,
} from "../API/projectAPI";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Pencil } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import ProjectModal from "../Modal/ProjectModal";
import EditProjectModal from "../Modal/EditProjectModal"; // ✅ Import

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false); // ✅ For Edit
  const [selectedProject, setSelectedProject] = useState(null); // ✅ For edit modal

  const navigate = useNavigate();

  // ================= FETCH PROJECTS =================
  const fetchProjects = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const data = await getAllProjects();
      setProjects(data);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(true);
  }, []);

  // ================= CREATE PROJECT =================
  const handleCreateProject = async (formData, setModalLoading) => {
    try {
      setModalLoading(true);
      const newProject = await createProject(formData);
      setProjects((prev) => [...prev, newProject]);
      toast.success("Project Created Successfully");
      setModalOpen(false);
    } catch {
      toast.error("Create failed");
    } finally {
      setModalLoading(false);
    }
  };

  // ================= DELETE PROJECT =================
  const handleDelete = async (e, projectId) => {
    e.stopPropagation();
    if (!window.confirm("Do you want to delete this project?")) return;

    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success("Project Deleted Successfully");
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= EDIT PROJECT =================
  const handleEditClick = (project) => {
    setSelectedProject(project);
    setEditModalOpen(true);
  };

  const handleUpdateProject = (updatedProject) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
  };

  return (
    <div className="p-6 bg-gray-200 mt-5 rounded-xl">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-black">Projects</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 shadow-md hover:scale-105 transition px-4 py-2 rounded-lg text-blue-700"
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
        <div className="border">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-300">
              <tr>
                <th className="py-3 px-3 text-center">SI NO</th>
                <th className="py-3 px-3 text-center">Project Name</th>
                <th className="py-3 px-3 text-center">Key</th>
                <th className="py-3 px-3 text-center">Description</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {projects.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-500">
                    No projects found
                  </td>
                </tr>
              )}

              {projects.map((project, index) => (
                <tr
                  key={project.id}
                  className="border-t border-gray-800 hover:bg-[#262626] hover:text-white transition"
                >
                  <td className="py-3 text-center">{index + 1}</td>

                  <td
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="py-3 text-center font-medium hover:underline cursor-pointer"
                  >
                    {project.name}
                  </td>

                  <td className="py-3 text-center">{project.key}</td>
                  <td className="py-3 text-center">{project.description || "—"}</td>

                  <td className="py-3 flex gap-2.5 text-center justify-center">
                    <Pencil
                      size={16}
                      className="cursor-pointer hover:scale-110 text-blue-600"
                      onClick={() => handleEditClick(project)}
                    />
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

      {/* CREATE MODAL */}
      {modalOpen && (
        <ProjectModal
          setModalOpen={setModalOpen}
          onSubmit={handleCreateProject}
          onBulkUpload={fetchProjects}
        />
      )}

      {/* EDIT MODAL */}
      {editModalOpen && selectedProject && (
        <EditProjectModal
          project={selectedProject}
          setModalOpen={setEditModalOpen}
          onUpdate={handleUpdateProject}
        />
      )}
    </div>
  );
};

export default ProjectManagement;

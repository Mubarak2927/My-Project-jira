import React, { useEffect, useState } from "react";
import { Upload, FileText, Download, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  getAllProjects,
  getProjectDocuments,
  deleteProjectDocument,
  downloadProjectDocument,
} from "../API/projectAPI";
import UploadDocModal from "../Modal/UploadDocModal";

const Docs = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [documents, setDocuments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Fetch projects
  useEffect(() => {
    getAllProjects()
      .then((data) => {
        setProjects(data);
        if (data.length) setSelectedProject(data[0].id);
      })
      .catch(() => toast.error("Failed to load projects"));
  }, []);

  // Fetch documents
  useEffect(() => {
    if (!selectedProject) return;
    getProjectDocuments(selectedProject)
      .then(setDocuments)
      .catch(() => toast.error("Failed to load documents"));
  }, [selectedProject]);

  // Delete document
  const handleDelete = async (docId) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await deleteProjectDocument(selectedProject, docId);
      toast.success("Document deleted");
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="h-[93vh] bg-gray-300 p-6 rounded-2xl">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-6">📂 Project Documents</h1>

      {/* Project Select */}
      <div className="flex justify-between mb-10">
        <div>
          <label className="font-semibold">Select Projects :</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="p-2 rounded-lg ml-3 border"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-500 cursor-pointer hover:scale-103 transition text-white flex gap-2 p-2 rounded-xl"
        >
          <Upload size={18} /> Upload
        </button>
      </div>

      {/* Documents */}
      {/* Documents */}
<div className="grid grid-cols-4 p-5 gap-6 mt-5">
  {documents.map((doc) => (
    <div
      key={doc.id}
      className="relative bg-gray-100 rounded-xl p-4 shadow-md hover:shadow-lg transition"
    >
      {/* Folder tab */}
      <div className="absolute -top-3 left-4 w-20 h-4 bg-gray-200 rounded-t-md"></div>

      {/* Folder Body */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex items-center gap-2">
          <FileText size={22} className="text-yellow-700" />
          <span className="font-semibold truncate">
            {doc.name}
          </span>
        </div>
        <p>
              {doc.description}
            </p>

       

        {/* Actions */}
        <div className="flex justify-between items-center gap-4 ">
          <div>
            
               <p className="text-xs mt-5 text-gray-600">
          <span className="font-semibold"> Uploaded by :</span>{doc.uploaded_by_name}
        </p>
          </div>
        <div className="flex gap-3">
          <button
            onClick={() =>
              downloadProjectDocument(selectedProject, doc.id)
            }
            className="text-blue-600 cursor-pointer hover:scale-105  transition"
            title="Download"
          >
            <Download size={18} />
          </button>

          <button
            onClick={() => handleDelete(doc.id)}
            className="text-red-600 cursor-pointer hover:scale-106  transition"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>

        </div>
          
        </div>
      </div>
    </div>
  ))}
</div>


      {/* Upload Modal */}
      {showUploadModal && (
        <UploadDocModal
          projects={projects}
          selectedProject={selectedProject}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() =>
            getProjectDocuments(selectedProject).then(setDocuments)
          }
        />
      )}
    </div>
  );
};

export default Docs;

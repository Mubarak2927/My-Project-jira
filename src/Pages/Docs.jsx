import React, { useEffect, useState } from "react";
import { Upload, FileText, Download, Trash2, Eye } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  getAllProjects,
  getProjectDocuments,
  deleteProjectDocument,
  downloadProjectDocument, // ✅ Added download API
} from "../API/projectAPI";
import UploadDocModal from "../Modal/UploadDocModal";

const Docs = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [documents, setDocuments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewDoc, setViewDoc] = useState(null); // ❗ kept

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
    <div className="h-[93vh] bg-gray-100 p-6 rounded-2xl">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">📂 Project Documents</h1>

      {/* Project Select */}
      <div className="flex justify-between mb-4">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="p-2 rounded-lg border"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-500 text-white flex gap-2 p-2 rounded-xl"
        >
          <Upload size={18} /> Upload
        </button>
      </div>

      {/* Documents */}
      <div className="grid grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl p-4 shadow flex flex-col gap-2"
          >
            <div className="flex gap-2 items-center">
              <FileText className="text-red-500" />
              <span className="truncate font-medium">{doc.name}</span>
            </div>

            <p className="text-xs text-gray-500">
              Uploaded by {doc.uploaded_by_name}
            </p>

            <div className="flex gap-4 mt-3">
              {/* 👁️ VIEW (DIRECT OPEN) */}
              {viewDoc && viewDoc.id === doc.id && (
                <div>
                  {/* Example: PDF/Image viewer modal can go here */}
                </div>
              )}

              {/* ⬇️ DOWNLOAD */}
              <button
                onClick={() =>
                  downloadProjectDocument(selectedProject, doc.id)
                }
                className="text-blue-600"
                title="Download"
              >
                <Download size={18} />
              </button>

              {/* 🗑 DELETE */}
              <button
                onClick={() => handleDelete(doc.id)}
                className="text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadDocModal
          projects={projects}
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

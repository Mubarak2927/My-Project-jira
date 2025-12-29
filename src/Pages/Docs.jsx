import React, { useEffect, useState } from "react";
import { Upload, FileText, Download, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  uploadProjectDocument,
  getProjectDocuments,
  deleteProjectDocument,
  downloadProjectDocument,
  getAllProjects,
} from "../API/projectAPI";

const Docs = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      const data = await getAllProjects();
      setProjects(Array.isArray(data) ? data : []);
      if (data.length > 0) setSelectedProject(data[0].id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch documents
  const fetchDocuments = async (projectId) => {
    if (!projectId) return;
    try {
      const data = await getProjectDocuments(projectId);
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load documents");
    }
  };

  useEffect(() => {
    if (selectedProject) fetchDocuments(selectedProject);
  }, [selectedProject]);

  // Upload document
  const handleUpload = async () => {
    if (!file) return toast.error("No file selected");
    if (!selectedProject) return toast.error("Select a project");

    const formData = new FormData();
    formData.append("file", file);          // must match API key
    formData.append("name", file.name);     // optional

    try {
      setLoading(true);
      await uploadProjectDocument(selectedProject, formData);
      toast.success("File uploaded successfully!");
      setFile(null);
      fetchDocuments(selectedProject);
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Download document
  const handleDownload = async (doc) => {
    if (!doc.id || !selectedProject) return;
    try {
      const res = await downloadProjectDocument(selectedProject, doc.id);
      const blob = new Blob([res]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.name;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Download failed");
    }
  };

  // Delete document
  const handleDelete = async (docId) => {
    if (!docId || !selectedProject) return;
    if (!window.confirm("Are you sure to delete this document?")) return;

    try {
      await deleteProjectDocument(selectedProject, docId);
      toast.success("Document deleted");
      fetchDocuments(selectedProject);
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="h-[93vh] bg-gray-100 p-6 rounded-2xl">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">📂 Project Documents</h1>

      {/* Project Dropdown */}
      <div className="mb-4">
        <label className="font-medium mr-3">Select Project:</label>
        <select
          className="p-2 rounded-lg border"
          value={selectedProject || ""}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-5 rounded-xl shadow mb-6 flex items-center gap-3">
        <input
          type="file"
          id="fileUpload"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
        />
        <label
          htmlFor="fileUpload"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg cursor-pointer"
        >
          <Upload size={18} />
          {file ? file.name : "Choose File"}
        </label>
        <button
          onClick={handleUpload}
          disabled={!file || loading || !selectedProject}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* Documents List */}
      <div className="grid grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl p-4 shadow flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <FileText className="text-red-500" />
              <span className="font-medium truncate">{doc.name}</span>
            </div>
            <p className="text-xs text-gray-500">
              Uploaded by {doc.uploaded_by_name}
            </p>
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => handleDownload(doc)}
                className="text-blue-600"
              >
                <Download size={18} />
              </button>
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
    </div>
  );
};

export default Docs;

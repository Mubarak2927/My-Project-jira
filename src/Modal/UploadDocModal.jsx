import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { uploadProjectDocument } from "../API/projectAPI";

const UploadDocModal = ({
  projects,
  selectedProject,
  onClose,
  onSuccess,
}) => {
  const [projectId, setProjectId] = useState(selectedProject || "");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState(""); // ✅ NEW
  const [loading, setLoading] = useState(false);

  // when modal opens, set default project
  useEffect(() => {
    if (selectedProject) {
      setProjectId(selectedProject);
    }
  }, [selectedProject]);

  const handleUpload = async () => {
    if (!projectId) return toast.error("Select project da");
    if (!file) return toast.error("Choose file da");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", fileName || file.name);
      if (description) formData.append("description", description); // ✅ NEW

      await uploadProjectDocument(projectId, formData);

      toast.success("File uploaded successfully");
      onSuccess(projectId);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Upload size={20} /> Upload Document
        </h2>

        {/* 🔽 PROJECT SELECT */}
        <label className="block text-sm font-medium mb-1">
          Select Project
        </label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full border rounded-lg p-2 mb-3"
        >
          <option value="">-- Select Project --</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* 📂 FILE INPUT */}
        <label className="block text-sm font-medium mb-1">
          Choose File
        </label>
        <input
          type="file"
          accept="*/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-3 w-full bg-blue"
        />

        {/* OPTIONAL NAME */}
        <input
          type="text"
          placeholder="Document Name (optional)"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="mb-3 p-2 border rounded w-full"
        />

        {/* 📝 DESCRIPTION */}
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mb-4 p-2 border rounded w-full resize-none"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-blue-500 text-white p-2 rounded w-full flex items-center justify-center gap-2"
        >
          <Upload size={18} />
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
};

export default UploadDocModal;

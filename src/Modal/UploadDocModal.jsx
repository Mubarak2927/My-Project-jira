// UploadDocModal.jsx
import React, { useState } from "react";
import { X, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { uploadProjectDocument } from "../API/projectAPI";

const UploadDocModal = ({ projects, onClose, onSuccess }) => {
  const [projectId, setProjectId] = useState(projects?.[0]?.id || "");
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!projectId) return toast.error("Select project");
    if (!file) return toast.error("Choose file");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      if (name) formData.append("name", name);
      if (description) formData.append("description", description);
      if (tags) formData.append("tags", tags);

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload Document</h2>
          <X className="cursor-pointer" onClick={onClose} />
        </div>

        {/* Select Project */}
        <label className="block text-sm mb-1">Select Project</label>
        <select
          className="w-full border rounded-lg p-2 mb-3"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Choose File */}
        <label className="block text-sm mb-1">Choose File</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-3"
        />

        {/* Optional fields */}
        <input
          type="text"
          placeholder="Document name (optional)"
          className="w-full border rounded-lg p-2 mb-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          placeholder="Description (optional)"
          className="w-full border rounded-lg p-2 mb-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="text"
          placeholder="Tags (comma separated)"
          className="w-full border rounded-lg p-2 mb-4"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl p-2 flex items-center justify-center gap-2"
        >
          <Upload size={18} />
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
};

export default UploadDocModal;

import axios from "axios";
import { Trash2 } from "lucide-react";
import React, { useRef, useState } from "react";


const ProjectModal = ({ setModalOpen, onSubmit ,handleBulkUpload}) => {
  const [projectName, setProjectName] = useState("");
  const [projectKey, setProjectKey] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);
   const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

 

 const handleSubmit = (e) => {
  e.preventDefault();

  onSubmit(
  {
    name: projectName,
    key: projectKey,
    description,
   start_date: startDate ? `${startDate}T00:00:00` : null,
end_date: endDate ? `${endDate}T23:59:59` : null,

  },
  setLoading
);

};

  
  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="relative bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Close */}
        <button
          onClick={() => setModalOpen(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Create Project</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project Name"
            required
            className="w-full border p-2 rounded-lg"
          />

          <input
            value={projectKey}
            onChange={(e) => setProjectKey(e.target.value)}
            placeholder="Project Key"
            required
            className="w-full border p-2 rounded-lg"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full border p-2 rounded-lg"
          />
          <div className="grid grid-cols-2 gap-3">
  <input
    type="date"
    value={startDate}
    onChange={(e) => setStartDate(e.target.value)}
    required
    className="w-full border p-2 rounded-lg"
  />

  <input
    type="date"
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
    required
    className="w-full border p-2 rounded-lg"
  />
</div>

          

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg"
            >
              Close
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;

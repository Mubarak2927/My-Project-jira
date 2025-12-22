import React, { useState } from "react";
import { uploadBulkFile } from "../API/projectAPI";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

const ProjectModal = ({ setModalOpen, onSubmit, onBulkUpload }) => {
  const [projectName, setProjectName] = useState("");
  const [projectKey, setProjectKey] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= MANUAL CREATE =================
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

  // ================= FILE SELECT =================
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Only Excel files (.xls, .xlsx) are allowed!");
      e.target.value = null;
      return;
    }

    setFile(selectedFile);
  };

  // ================= BULK UPLOAD =================
  const handleUpload = async () => {
    if (!file) return toast.error("Select a file first!");

    try {
      setLoading(true);
      await uploadBulkFile(file);

      toast.success("Project Created successfully!");
      onBulkUpload(true); // 🔥 JUST REFRESH PROJECTS
      setFile(null);
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="relative bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
        <button
          onClick={() => setModalOpen(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">
          Create Project / Bulk Upload
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* MANUAL FIELDS */}
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project Name"
            className="w-full border p-2 rounded-lg"
          />

          <input
            value={projectKey}
            onChange={(e) => setProjectKey(e.target.value)}
            placeholder="Project Key"
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
              className="w-full border p-2 rounded-lg"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border p-2 rounded-lg"
            />
          </div>

          {/* BULK UPLOAD */}
         {/* BULK UPLOAD */}
<div>
  <h1 className="text-lg font-semibold mt-4">Upload Excel File</h1>

  {/* HIDDEN FILE INPUT */}
  <input
    type="file"
    accept=".xls,.xlsx"
    id="excelUpload"
    onChange={handleFileChange}
    className="hidden"
  />

  {/* FILE SELECT / DISPLAY */}
  {!file ? (
    <label
      htmlFor="excelUpload"
      className="block mt-3 w-full text-center cursor-pointer
                 bg-gray-200 hover:bg-gray-300 text-gray-700
                 p-2 rounded-lg"
    >
      Choose Excel File
    </label>
  ) : (
    <div className="flex items-center justify-between mt-3
                    bg-gray-100 p-2 rounded-lg">
      <span className="text-sm text-gray-700 truncate">
        {file.name}
      </span>

      <button
        type="button"
        onClick={() => setFile(null)}
        className="text-red-600 font-semibold text-sm hover:text-red-800"
      >
        <Trash2 size={15}/>
      </button>
    </div>
  )}

  {/* UPLOAD BUTTON */}
  <button
    type="button"
    onClick={handleUpload}
    disabled={loading || !file}
    className="bg-green-600 rounded-lg text-white p-2 mt-3 w-full disabled:opacity-50"
  >
    {loading ? "Uploading..." : "Upload Excel"}
  </button>
</div>


          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-2 mt-4">
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
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;

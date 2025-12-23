import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { createEpic } from "../API/projectAPI";
import toast from "react-hot-toast";

const EpicCreate = () => {
  const navigate = useNavigate();
  const { project } = useOutletContext();

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Epic Name required");
      return;
    }

    try {
      await createEpic({
        name: form.name,
        description: form.description,
        project_id: project.id,
      });
      toast.success("Epic Created Successfully");

      // Navigate back & refresh backlog
      navigate(-1, { state: { refreshBacklog: true } });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create epic");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/70 z-50 flex h-screen justify-center items-center pt-6">
      <div className="bg-white   rounded-lg shadow-xl p-6">
        <h2 className="text-lg font-semibold text-blue-600 mb-4">New Epic</h2>

        <input
          placeholder="Epic Name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          className="w-full border rounded p-2 mb-3"
          autoFocus
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          className="w-full border rounded p-3 mb-4"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-1 border rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-1 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EpicCreate;

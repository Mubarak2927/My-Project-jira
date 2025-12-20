import React, { useState } from "react";
import { EllipsisVertical, Plus } from "lucide-react";

const Epic = ({ onCreate, epics, selectedEpic, onSelectEpic }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;

    onCreate({
      name,
      description: description || "No description",
    });

    setName("");
    setDescription("");
  };

  return (
    <div className=" shadow-md/50 bg-gray-100 p-4 rounded-xl max-w-md h-[70vh] space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-3">Create Epic</h2>

        <input
          type="text"
          placeholder="Epic name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-2 px-3 py-2 shadow-md/20 outline-none  rounded-lg"
        />

        <textarea
          placeholder="Epic description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-3 px-3 py-2 shadow-md/20 outline-none rounded-lg"
        />

        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Epic
        </button>
      </div>

      <div className="space-y-2 h-[31vh] overflow-y-auto">
        {epics.length === 0 && (
          <p className="text-sm text-gray-500">No epics yet</p>
        )}

        {epics.map((epic) => (
          <div
            key={epic._id}
            onClick={() => onSelectEpic(epic)}
            className={`p-3 border rounded-lg cursor-pointer
              ${
                selectedEpic?._id === epic._id
                  ? "bg-blue-100 border-blue-500"
                  : "bg-gray-50"
              }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{epic.name}</h4>
                <p className="text-sm text-gray-600">{epic.description}</p>
              </div>
              <button>
                <EllipsisVertical size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Epic;

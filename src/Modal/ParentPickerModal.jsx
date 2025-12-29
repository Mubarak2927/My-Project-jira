// ParentPickerModal.jsx
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { createIssueLink, getAllIssues } from '../API/projectAPI'

const ParentPickerModal = ({ issue, onClose, onLinked }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [selectedParents, setSelectedParents] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllIssues(issue.project_id);
        const list = Array.isArray(data) ? data : data.items || [];

        // Allow all types except self
        const parentCandidates = list.filter(
          (i) => i.id !== issue.id && ["epic", "bug", "story", "task", "subtask"].includes(i.type.toLowerCase())
        );

        setIssues(parentCandidates);
      } catch {
        toast.error("Failed to load issues");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [issue.id, issue.project_id]);

  const normalizeType = (type) => {
    switch (type.toLowerCase()) {
      case "epic":
      case "issue":
        return type.toLowerCase();
      case "story":
        return "issue";
      default:
        return "issue";
    }
  };

  const toggleSelect = (parent) => {
    setSelectedParents((prev) =>
      prev.includes(parent.id)
        ? prev.filter((id) => id !== parent.id)
        : [...prev, parent.id]
    );
  };

  const handleLinkAll = async () => {
  if (linking || selectedParents.length === 0) return;

  try {
    setLinking(true);
    let successCount = 0;
    for (let pid of selectedParents) {
      const parent = issues.find((i) => i.id === pid);
      try {
        await createIssueLink({
          source_id: parent.id,
          source_type: normalizeType(parent.type),
          target_id: issue.id,
          target_type: "issue",
          reason: "relates_to",
        });
        successCount++;
      } catch (err) {
        console.error(`Failed to link ${parent.name}`, err);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} parent(s) linked`);
      onLinked(); // refresh parent links in BacklogModal
    } else {
      toast.error("No links succeeded");
    }

  } finally {
    setLinking(false);
    onClose(); // close the modal regardless of errors
  }
};


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[600px] max-h-[80vh] rounded-xl shadow-xl flex flex-col">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h3 className="font-semibold">Select Parent(s)</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-2">
          {loading ? (
            <p>Loading...</p>
          ) : issues.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              No parent issues available
            </p>
          ) : (
            issues.map((i) => (
              <label
                key={i.id}
                className={`border rounded px-3 py-2 flex justify-between items-center cursor-pointer ${
                  linking ? "opacity-50 pointer-events-none" : "hover:bg-gray-50"
                } ${selectedParents.includes(i.id) ? "bg-blue-100" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedParents.includes(i.id)}
                    onChange={() => toggleSelect(i)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium">{i.name}</p>
                    <p className="text-xs text-gray-500">{i.type.toUpperCase()}</p>
                  </div>
                </div>
              </label>
            ))
          )}
        </div>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded m-4 disabled:opacity-50"
          onClick={handleLinkAll}
          disabled={linking || selectedParents.length === 0}
        >
          Link Selected
        </button>
      </div>
    </div>
  );
};

export default ParentPickerModal;

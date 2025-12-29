import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { getAllIssues, createIssueLink } from "../API/ProjectAPI";

const ParentPickerModal = ({ issue, onClose, onLinked }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllIssues();
        setIssues(
          data.filter((i) => i.id !== issue.id) // ❌ self link avoid
        );
      } catch {
        toast.error("Failed to load issues");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [issue.id]);

  const handleLink = async (parent) => {
    try {
      await createIssueLink({
        source_id: parent.id,
        source_type: parent.type,
        target_id: issue.id,
        target_type: "issue",
        reason: "relates_to",
      });

      toast.success("Parent linked");
      onLinked(parent);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Link failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[600px] max-h-[80vh] rounded-xl shadow-xl flex flex-col">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h3 className="font-semibold">Select Parent</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-2">
          {loading ? (
            <p>Loading...</p>
          ) : (
            issues.map((i) => (
              <div
                key={i.id}
                className="border rounded px-3 py-2 hover:bg-gray-50 cursor-pointer flex justify-between"
                onClick={() => handleLink(i)}
              >
                <div>
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-gray-500">
                    {i.type.toUpperCase()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentPickerModal;

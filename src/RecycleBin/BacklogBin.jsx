import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getRecycleBinItems,
  permanentDeleteRecycleItem,
  restoreRecycleItem,
} from "../API/projectAPI";
import { RotateCcw, Trash2 } from "lucide-react";

const BacklogBin = () => {
  const { projectId } = useParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Fetch deleted backlog items
  const fetchTrash = async () => {
    try {
      setLoading(true);

      const res = await getRecycleBinItems(projectId);

      // ✅ API returns { items: [], total }
      const list = Array.isArray(res?.items) ? res.items : [];

      // ✅ backlog issues only
      const backlogIssues = list.filter(
        (item) =>
          item?.type === "issue" && item?.details?.location === "backlog"
      );

      setItems(backlogIssues);
    } catch (err) {
      console.error("❌ BacklogBin error", err);
      toast.error("Failed to load backlog recycle bin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchTrash();
    }
  }, [projectId]);

  // 🔥 Restore item
  const handleRestore = async (item) => {
    try {
      await restoreRecycleItem(item.type, item.id);
      toast.success("Item restored");
      fetchTrash();
    } catch (err) {
      toast.error("Restore failed");
    }
  };

  // 🔥 Permanent delete
  const handlePermanentDelete = async (item) => {
    if (!window.confirm("Permanently delete this item?")) return;

    try {
      await permanentDeleteRecycleItem(item.type, item.id);
      toast.success("Item deleted permanently");
      fetchTrash();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Backlog Recycle Bin</h1>

      {loading && (
        <div className="text-center text-gray-500 py-10">
          Loading deleted backlog items...
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center text-gray-400 py-10">
          No deleted backlog items
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-center text-sm">
            <thead className="bg-gray-300">
              <tr>
                <th className=" p-3 text-center">#</th>
                <th className=" p-3">Name</th>
                <th className=" p-3">Type</th>
                <th className=" p-3">Deleted At</th>
                <th className=" p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-200 cursor-pointer">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.type}</td>

                  <td className="p-3 text-gray-500 text-xs">
                    {item.deleted_at
                      ? new Date(item.deleted_at).toLocaleString()
                      : "-"}
                  </td>

                  <td className="p-3 justify-center flex gap-4">
                    <button
                      onClick={() => handleRestore(item)}
                      className="p-2 rounded-full cursor-pointer bg-green-100 text-green-600 hover:bg-green-200 transition"
                    >
                      <RotateCcw size={17} />
                    </button>

                    <button
                      onClick={() => handlePermanentDelete(item)}
                      className="p-2 rounded-full cursor-pointer bg-red-100 text-red-600 hover:bg-red-200 transition"
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BacklogBin;

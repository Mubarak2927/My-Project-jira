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
  const [selectedIds, setSelectedIds] = useState([]);


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
  // single select
const toggleSelect = (id) => {
  setSelectedIds((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );
};

// select all
const toggleSelectAll = () => {
  if (selectedIds.length === items.length) {
    setSelectedIds([]);
  } else {
    setSelectedIds(items.map((item) => item.id));
  }
};
const handleBulkDelete = async () => {
  if (selectedIds.length === 0) {
    toast.error("Select items first da 😅");
    return;
  }

  if (!window.confirm(`Delete ${selectedIds.length} items permanently?`))
    return;

  try {
    await Promise.all(
      selectedIds.map((id) =>
        permanentDeleteRecycleItem("issue", id)
      )
    );

    toast.success("Selected items deleted");
    setSelectedIds([]);
    fetchTrash();
  } catch (err) {
    toast.error("Bulk delete failed");
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
      <div className="flex justify-between mb-3">
  <h1 className="text-xl font-semibold">Backlog Recycle Bin</h1>

  {selectedIds.length > 0 && (
    <button
      onClick={handleBulkDelete}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
    >
      Delete Selected ({selectedIds.length})
    </button>
  )}
</div>


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
    <th className="p-3">
      <input
        type="checkbox"
        checked={
          items.length > 0 && selectedIds.length === items.length
        }
        onChange={toggleSelectAll}
      />
    </th>
    <th className="p-3">#</th>
    <th className="p-3">Name</th>
    <th className="p-3">Type</th>
    <th className="p-3">Deleted At</th>
    <th className="p-3">Actions</th>
  </tr>
</thead>


            <tbody>
  {items.map((item, index) => (
    <tr key={item.id} className="hover:bg-gray-200">
      <td className="p-3">
        <input
          type="checkbox"
          checked={selectedIds.includes(item.id)}
          onChange={() => toggleSelect(item.id)}
        />
      </td>

      <td className="p-3">{index + 1}</td>
      <td className="p-3">{item.name}</td>
      <td className="p-3">{item.type}</td>

      <td className="p-3 text-gray-500 text-xs">
        {item.deleted_at
          ? new Date(item.deleted_at).toLocaleString()
          : "-"}
      </td>

      <td className="p-3 flex gap-4 justify-center">
        <button
          onClick={() => handleRestore(item)}
          className="p-2 bg-green-100 text-green-600 rounded-full"
        >
          <RotateCcw size={17} />
        </button>

        <button
          onClick={() => handlePermanentDelete(item)}
          className="p-2 bg-red-100 text-red-600 rounded-full"
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

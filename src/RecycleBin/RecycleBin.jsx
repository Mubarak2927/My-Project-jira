import React, { useEffect, useState } from "react";
import { CircleArrowLeft, Recycle, RotateCcw, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  getRecycleBinItems,
  permanentDeleteRecycleItem,
  restoreRecycleItem,
} from "../API/projectAPI";
import { useNavigate } from "react-router";

const RecycleBin = () => {
  const navigate=useNavigate()
  const [items, setItems] = useState([]);
  const project_id = null;

  const fetchRecycleBin = async () => {
    try {
      const res = await getRecycleBinItems(project_id);
      const projectItems = Array.isArray(res.items)
        ? res.items.filter((item) => item.type === "project")
        : [];
      setItems(projectItems);
    } catch {
      toast.error("Failed to load recycle bin");
    }
  };

  useEffect(() => {
    fetchRecycleBin();
  }, []);

  const handleRestore = async (item) => {
    if (!window.confirm("Do you want restore this Project?")) return;

    try {
      await restoreRecycleItem("project", item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success("Project Restored Sucessfully");
    } catch {
      toast.error("Restore failed");
    }
  };

  const handlePermanentDelete = async (item) => {
    if (!window.confirm("Permanent delete?")) return;

    try {
      await permanentDeleteRecycleItem("project", item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success("Project permanently deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6">
      <p className="flex gap-2 items-center  mb-5">
<CircleArrowLeft
onClick={() => navigate('/projects')}
 size={25} className="text-blue-600 hover:scale-110 cursor-pointer"/><span>Click to Back</span>
      </p>
        <Toaster position="top-right"/>
        <h1 className="text-xl flex items-center gap-3 font-semibold text-gray-800">
            <Recycle className="text-green-500 " />Recycle Bin
          </h1>
      <div className="bg-white rounded-2xl  mt-5 shadow-md ">
        {/* Empty State */}
        {items.length === 0 && (
          <div className="py-10 text-center text-gray-500">
            No deleted projects found
          </div>
        )}

        {/* Table */}
        {items.length > 0 && (
          <div className="overflow-x-auto rounded-2xl">
            <table className="w-full  text-sm">
              <thead className="bg-gray-300 text-gray-600">
                <tr>
                  <th className="px-6 py-3 text-center">SI No</th>
                  <th className="px-6 py-3 text-center">Project Name</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.id}
                    className=" hover:bg-gray-100  transition"
                  >
                    <td className="px-6 text-center py-3">{index + 1}</td>
                    <td className="px-6 py-3 text-center font-medium text-gray-800">
                      {item.name}
                    </td>
                    
                    <td className="px-6 py-3">
                      <div className="flex justify-center gap-4">
                        <button
                          title="Restore"
                          onClick={() => handleRestore(item)}
                          className="p-2 rounded-full cursor-pointer bg-green-100 text-green-600 hover:bg-green-200 transition"
                        >
                          <RotateCcw size={16} />
                        </button>

                        <button
                          title="Permanent Delete"
                          onClick={() => handlePermanentDelete(item)}
                          className="p-2 rounded-full cursor-pointer bg-red-100 text-red-600 hover:bg-red-200 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecycleBin;

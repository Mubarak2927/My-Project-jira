import { X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const WorkItemCreate = () => {
  const navigate = useNavigate();
  const { type } = useParams();

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-center items-start pt-6">
      <div className="bg-white w-[95%] h-[90%] rounded-lg shadow-xl overflow-hidden">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-5 py-3 border-b">
          <div className="flex items-center gap-2">
            <span className="text-orange-500 font-semibold uppercase">
              New {type}
            </span>
            <span className="text-red-600 text-sm">
              • Field 'Title' cannot be empty
            </span>
          </div>

          <div className="flex gap-2">
            <button
              className="px-4 py-1 bg-gray-200 rounded text-gray-500 cursor-not-allowed"
            >
              Save
            </button>
            <button onClick={() => navigate(-1)}>
              <X />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 grid grid-cols-3 gap-6 h-full">
          
          {/* LEFT */}
          <div className="col-span-2 space-y-4">
            <input
              placeholder="Enter title"
              className="w-full text-xl outline-none border-b pb-2"
            />

            <textarea
              placeholder="Click to add Description"
              className="w-full h-40 border rounded p-3"
            />

            <div>
              <h3 className="font-medium mb-2">Discussion</h3>
              <input
                placeholder="Add a comment"
                className="w-full border rounded p-2"
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-500">State</p>
              <p>To Do</p>
            </div>

            <div>
              <p className="text-gray-500">Priority</p>
              <p>2</p>
            </div>

            <div>
              <p className="text-gray-500">Start Date</p>
              <input type="date" className="border p-1 rounded w-full" />
            </div>

            <div>
              <p className="text-gray-500">Target Date</p>
              <input type="date" className="border p-1 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkItemCreate;

import React, { useEffect, useState } from "react";
import { createEmployee, getAllEmployeesList } from "../API/projectAPI";

const emptyForm = {
  emp_id: "",
  full_name: "",
  email: "",
  password: "",
};

const EmployeeMangement = () => {
  const [openModal, setOpenModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const fetchEmployees = async () => {
    const res = await getAllEmployeesList();
    setEmployees(res);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await createEmployee(form);
    setOpenModal(false);
    setForm(emptyForm);
    fetchEmployees();
  };

  const handleEdit = (emp) => {
    setEditId(emp.id);
    setForm({
      emp_id: emp.emp_id || "",
      full_name: emp.full_name,
      email: emp.email,
      password: "",
    });
    setOpenModal(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Employee Management</h2>
        <button
          onClick={() => {
            setEditId(null);
            setForm(emptyForm);
            setOpenModal(true);
          }}
          className="text-blue-600 bg-gray-100 hover:bg-gray-300 shadow-sm/30 hover:scale-105 transition cursor-pointer px-4 py-2 rounded"
        >
          + Create Profile
        </button>
      </div>

     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {employees.map((emp) => (
    <div
      key={emp.id}
      className="bg-white rounded-xl shadow-lg p-5 hover:shadow-2xl transition-shadow duration-300 relative"
    >
      <div className="flex justify-center mb-4">
 
   
    <div className="w-15 h-15 rounded-full flex items-center justify-center bg-blue-500 text-white text-xl font-bold border-2 border-blue-500">
      {emp.full_name.charAt(0).toUpperCase()}
    </div>
  
</div>


      {/* Name */}
      <h3 className="text-lg font-semibold text-center mb-1">
        {emp.full_name}
      </h3>

      {/* Email */}
      <p className="text-sm text-gray-600 text-center mb-2">{emp.email}</p>

      {/* Employee Details */}
      <div className="text-sm text-gray-700 space-y-1">
        <p>
          <span className="font-semibold">Emp ID:</span> {emp.emp_id || "-"}
        </p>
        <p>
          <span className="font-semibold">Dept:</span>{" "}
          {emp.work_info?.department || "-"}
        </p>
        <p>
          <span className="font-semibold">Designation:</span>{" "}
          {emp.work_info?.designation || "-"}
        </p>
      </div>

      {/* Edit Button */}
      <button
        onClick={() => handleEdit(emp)}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Edit Profile
      </button>
    </div>
  ))}
</div>


      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white w-[400px] rounded p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editId ? "Edit Employee" : "Create Employee"}
            </h3>

            <input
              name="emp_id"
              value={form.emp_id}
              onChange={handleChange}
              placeholder="Employee ID"
              className="w-full border p-2 mb-3 rounded"
            />

            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full border p-2 mb-3 rounded"
            />

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full border p-2 mb-3 rounded"
            />

            {!editId && (
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full border p-2 mb-4 rounded"
              />
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeMangement;

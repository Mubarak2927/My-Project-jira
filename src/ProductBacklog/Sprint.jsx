import React, { useState } from "react";
import toast from "react-hot-toast";
import { createSprint } from "../API/ProjectAPI";
import { useOutletContext } from "react-router";

const Sprint = ({ onCreated }) => {
  const { project } = useOutletContext();

  const [form, setForm] = useState({
    name: "",
    goal: "",
    start_date: "",
    end_date: "",
  });

  const setDuration = (days) => {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + days);

    setForm({
      ...form,
      start_date: start.toISOString().split("T")[0],
      end_date: end.toISOString().split("T")[0],
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    if (!form.name || !form.start_date || !form.end_date) {
      toast.error("Sprint name & dates required da 😑");
      return;
    }

    const payload = {
      project_id: project._id,
      name: form.name,
      goal: form.goal,
      start_date: new Date(form.start_date).toISOString().split(".")[0],
      end_date: new Date(form.end_date).toISOString().split(".")[0],
    };

    try {
      await createSprint(payload);
      toast.success("Sprint created successfully 🚀");
      onCreated && onCreated();
    } catch (err) {
      console.error(err?.response?.data || err);
      toast.error("Sprint create failed ❌");
    }
  };

  return (
    <div className="bg-zinc-900 shadow-lg p-6 rounded-2xl max-w-md mx-auto border border-zinc-700">
      <h2 className="text-2xl font-bold mb-5 text-orange-400 text-center">
        Create New Sprint
      </h2>

      <input
        type="text"
        name="name"
        placeholder="Sprint Name"
        value={form.name}
        onChange={handleChange}
        className="w-full p-3 mb-4 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition"
      />

      <textarea
        name="goal"
        placeholder="Sprint Goal"
        value={form.goal}
        onChange={handleChange}
        className="w-full p-3 mb-4 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition"
        rows={3}
      />

      <div className="flex justify-between gap-2 mb-4">
        <button
          onClick={() => setDuration(7)}
          className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl font-semibold hover:scale-105 transform transition"
        >
          Week 1
        </button>
        <button
          onClick={() => setDuration(14)}
          className="flex-1 py-2 bg-gradient-to-r from-green-500 to-green-700 rounded-xl font-semibold hover:scale-105 transform transition"
        >
          Week 2
        </button>
        <button
          onClick={() => setDuration(28)}
          className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl font-semibold hover:scale-105 transform transition"
        >
          Week 4
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        <input
          type="date"
          name="start_date"
          value={form.start_date}
          onChange={handleChange}
          className="flex-1 p-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition"
        />
        <input
          type="date"
          name="end_date"
          value={form.end_date}
          onChange={handleChange}
          className="flex-1 p-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition"
        />
      </div>

      <button
        onClick={handleCreate}
        className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-700 rounded-2xl font-bold text-white hover:scale-105 transform transition shadow-lg"
      >
        Create Sprint 🚀
      </button>
    </div>
  );
};

export default Sprint;

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getMyProfile } from "../API/projectAPI";
import {
  User,
  Briefcase,
  Calendar,
  Phone,
  Mail,
  MapPin,
  BadgeCheck,
} from "lucide-react";

const MyProfile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        setProfile(data);
      } catch {
        toast.error("Unable to load profile");
      }
    };
    fetchProfile();
  }, []);

  if (!profile) return <div className="p-10 text-center">Loading...</div>;

  const { personal_info, work_info, leave_balances } = profile;

  return (
    <div className="max-w-5xl mx-auto p-6 ">
      {/* ===== HEADER ===== */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <h1 className="text-3xl font-bold">{profile.full_name}</h1>
        <p className="text-gray-600">{work_info.designation}</p>

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-700">
          <span className="flex items-center gap-1">
            <Mail size={14} /> {profile.email}
          </span>
          <span className="flex items-center gap-1">
            <Phone size={14} /> {personal_info.phone_number}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={14} /> {personal_info.address}
          </span>
        </div>
      </div>

      {/* ===== GRID ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal */}
        <div className="bg-white rounded-xl p-6 border-l-4 border-indigo-500">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <User size={18} /> Personal
          </h3>
          <p>DOB: {personal_info.date_of_birth}</p>
          <p>Gender: {personal_info.gender}</p>
          <p>Status: {personal_info.marital_status}</p>
        </div>

        {/* Work */}
        <div className="bg-white rounded-xl p-6 border-l-4 border-green-500">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Briefcase size={18} /> Work
          </h3>
          <p>Department: {work_info.department}</p>
          <p>Type: {work_info.employment_type}</p>
          <p>Level: {work_info.experience_level}</p>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl p-6 border-l-4 border-purple-500">
          <h3 className="font-semibold mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {work_info.skills.map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Leaves */}
        <div className="bg-white rounded-xl p-6 border-l-4 border-red-500">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar size={18} /> Leave Summary
          </h3>
          <p>Year: {leave_balances[0].year}</p>
          <p>Casual: {leave_balances[0].casual_leave}</p>
          <p>Sick: {leave_balances[0].sick_leave}</p>
        </div>
      </div>

      {/* ===== FOOTER TIMELINE ===== */}
      <div className="mt-10 bg-white rounded-xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <BadgeCheck size={18} /> Career Timeline
        </h3>
        <div className="border-l-2 pl-4 space-y-3">
          <p>
            <b>{work_info.date_joined}</b> — Joined as{" "}
            {work_info.designation}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;

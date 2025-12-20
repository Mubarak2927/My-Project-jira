import { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { BadgeAlert } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.email || !form.password) {
      toast.error("Failed To Login");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "https://pmtoolapidev.digitaly.live/api/v1/login",
        {
          email: form.email,
          password: form.password,
        }
      );

      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);
      localStorage.setItem("role", res.data.role);

      toast.success("Login successfully ");
      navigate("/home");
    } catch (err) {
      setErrorMsg("Invalid email or password");
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-300">
  
        <Toaster position="top-right " />
 
      <div className="bg-white w-[380px] rounded-2xl shadow-md/50 p-8">
        <h1 className="text-2xl font-bold text-blue-600 text-center">
          Digitaly
        </h1>
        <p className="text-sm text-black text-center mt-1">
          Login to your dashboard
        </p>

        <form className="space-y-4 mt-6" onSubmit={handleLogin}>
          <div>
            <label className="text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`w-full mt-1 px-4 py-2 border rounded-lg ${
                errorMsg ? "border-red-500" : ""
              }`}
            />
          </div>
          <div>
            <label className="text-sm">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`w-full mt-1 px-4 py-2 border rounded-lg pr-10 ${
                  errorMsg ? "border-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute cursor-pointer right-3 top-1/2  -translate-y-1/2 text-sm text-gray-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

         

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 mt-5 cursor-pointer  text-white py-2 rounded-lg hover:bg-blue-700 transition hover:scale-102"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import background from "../assets/background.jpg";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth(); // make sure setUser is available in AuthContext

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === "zsohial6@gmail.com" && password === "Admin123!@#") {
      const adminUser = {
        email,
        role: "admin",
        name: "Admin Sohail",
      };

      // ✅ Save admin user in context
      setUser(adminUser);

      // ✅ Redirect to Admin Dashboard
      navigate("/admin-dashboard");
    } else {
      setError("Invalid admin credentials");
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen px-4 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${background})` }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* login card */}
      <div className="relative bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Admin Login
        </h1>

        {error && (
          <div className="mb-4 text-red-600 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

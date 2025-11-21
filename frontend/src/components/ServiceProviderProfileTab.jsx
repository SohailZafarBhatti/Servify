import React, { useEffect, useState } from "react";
import userService from "../services/userService";

const ServiceProviderProfileTab = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    cnic: "",
    serviceCategory: "",
    avatar: "",
    serviceDescription: "",
    experience: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          cnic: data.cnic || "",
          serviceCategory: data.serviceCategory || "",
          avatar: data.avatar || "",
          serviceDescription: data.serviceDescription || "",
          experience: data.experience || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setAvatarFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    // Validate required fields
    if (!profile.name?.trim()) {
      setError("Name is required");
      setSaving(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", profile.name || "");
      formData.append("phone", profile.phone || "");
      formData.append("address", profile.address || "");
      formData.append("cnic", profile.cnic || "");
      formData.append("serviceCategory", profile.serviceCategory || "");
      formData.append("serviceDescription", profile.serviceDescription || "");
      formData.append("experience", profile.experience || "");
      if (avatarFile) formData.append("avatar", avatarFile);

      console.log('Profile data being sent:');
      for (let [key, value] of formData.entries()) {
        console.log(key, ':', value);
      }
      const updated = await userService.updateProfile(formData);
      console.log('Received updated user:', updated);

      if (!updated) throw new Error("Empty response from server");

      setProfile({
        name: updated.name || "",
        email: updated.email || "",
        phone: updated.phone || "",
        address: updated.address || "",
        cnic: updated.cnic || "",
        serviceCategory: updated.serviceCategory || "",
        avatar: updated.avatar || "",
        serviceDescription: updated.serviceDescription || "",
        experience: updated.experience || "",
      });

      setMessage("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      
      let errorMessage = "❌ Failed to update profile.";
      
      if (err.response?.data?.message) {
        errorMessage = `❌ ${err.response.data.message}`;
      } else if (err.response?.status === 500) {
        errorMessage = "❌ Server error occurred. Please try again.";
      } else if (err.message) {
        errorMessage = `❌ ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6 text-center">⏳ Loading profile...</p>;

  return (
    <div className="max-h-[80vh] overflow-y-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">My Profile</h2>

      {message && <p className="text-green-600 text-sm mb-2">{message}</p>}
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={avatarFile ? URL.createObjectURL(avatarFile) : profile.avatar || "/default-avatar.png"}
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover border"
          />
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            disabled
            className="w-full border rounded px-3 py-2 mt-1 bg-gray-100"
          />
          <p className="text-xs text-gray-500">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Address</label>
          <textarea
            name="address"
            value={profile.address}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">CNIC</label>
          <input
            type="text"
            name="cnic"
            value={profile.cnic}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Service Category</label>
          <input
            type="text"
            name="serviceCategory"
            value={profile.serviceCategory}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Service Description</label>
          <textarea
            name="serviceDescription"
            value={profile.serviceDescription}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded px-3 py-2 mt-1"
            placeholder="Describe the services you provide..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Experience</label>
          <textarea
            name="experience"
            value={profile.experience}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded px-3 py-2 mt-1"
            placeholder="Describe your experience and qualifications..."
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default ServiceProviderProfileTab;

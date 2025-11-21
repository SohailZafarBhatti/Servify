import React, { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Message sent:", formData);
    alert("Your message has been sent successfully!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="bg-gray-50 py-12 px-6 lg:px-20">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-2xl p-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>
        <p className="text-gray-600 mb-10">
          Have questions or need assistance? We’re here to help. Fill out the
          form below or reach us directly through email or phone.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            ></textarea>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Send Message
          </button>
        </form>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Other Ways to Reach Us
          </h2>
          <ul className="text-gray-600 space-y-2">
            <li>
              📧 Email:{" "}
              <span className="font-medium text-blue-600">
                zsohial6@gmail.com
              </span>
            </li>
            <li>📞 Phone: +92 303-5065560</li>
            <li>📍 Location: Gujranwala, Pakistan</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Contact;

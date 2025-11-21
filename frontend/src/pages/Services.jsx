import React from "react";
import { useNavigate } from "react-router-dom";

// import images from assets
import cleaningImg from "../assets/cleaning.jpg";
import carpentryImg from "../assets/carpentry.jpg";
import plumbingImg from "../assets/plumbing.jpg";
import electricalImg from "../assets/electrical.jpg";
import gardeningImg from "../assets/gardening.jpg";
import paintingImg from "../assets/painting.jpg";

const Services = () => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate("/login"); // redirect to login page
  };

  const services = [
    {
      title: "Cleaning",
      description:
        "Professional cleaning services for homes, offices, and commercial spaces to maintain hygiene and freshness.",
      image: cleaningImg,
    },
    {
      title: "Carpentry",
      description:
        "Skilled carpenters for furniture repairs, custom woodwork, and installations with precision.",
      image: carpentryImg,
    },
    {
      title: "Plumbing",
      description:
        "Expert plumbing solutions for pipe leaks, installations, and urgent repairs at your doorstep.",
      image: plumbingImg,
    },
    {
      title: "Electrical",
      description:
        "Certified electricians to handle wiring, electrical repairs, and safe installations.",
      image: electricalImg,
    },
    {
      title: "Gardening",
      description:
        "Garden maintenance, landscaping, and plant care services to keep your outdoors beautiful.",
      image: gardeningImg,
    },
    {
      title: "Painting",
      description:
        "Professional painters to refresh your walls with high-quality finishes and vibrant colors.",
      image: paintingImg,
    },
  ];

  return (
    <div className="bg-gray-50 py-12 px-6 lg:px-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-10">
          Our Services
        </h1>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
          At Servify, we provide trusted professionals for your everyday needs.
          Choose from a wide range of services and get the job done with ease
          and reliability.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition duration-300"
            >
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  {service.title}
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  {service.description}
                </p>
                <button
                  onClick={handleBookNow}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;

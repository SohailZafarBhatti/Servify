import React from "react";

const About = () => {
  return (
    <div className="bg-gray-50 py-12 px-6 lg:px-20">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl p-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Us</h1>
        <p className="text-gray-600 mb-8">
          At <span className="font-semibold">Servify</span>, our mission is to
          make daily life easier by connecting people with trusted service
          providers in their local area. Whether you need help with home
          maintenance, delivery, or specialized tasks, Servify ensures reliable
          solutions at your fingertips.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Our Mission
            </h2>
            <p className="text-gray-600">
              We aim to empower communities by building trust and providing a
              safe and easy-to-use platform. Servify helps users save time while
              giving service providers access to more opportunities.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Our Vision
            </h2>
            <p className="text-gray-600">
              To become the leading task-based support system worldwide —
              creating stronger communities where people collaborate, share
              skills, and help one another.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

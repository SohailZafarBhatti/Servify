import React from "react";

const HelpCenter = () => {
  return (
    <div className="bg-gray-50 py-12 px-6 lg:px-20">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl p-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Help Center</h1>
        <p className="text-gray-600 mb-10">
          Welcome to the Servify Help Center. Here you’ll find resources and
          guidance to help you use our platform effectively.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Getting Started
            </h2>
            <p className="text-gray-600">
              New to Servify? Start by creating an account and setting up your
              profile. You can then post tasks or apply as a service provider.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Common Issues
            </h2>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-2">
              <li>Can’t log in? Try resetting your password.</li>

              <li>
                Task not visible? Refresh your dashboard or check filters.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Contact Support
            </h2>
            <p className="text-gray-600">
              If you need more help, reach out to our support team:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-2">
              <li>
                Email:{" "}
                <span className="font-medium text-blue-600">
                  zsohial6@gmail.com
                </span>
              </li>
              <li>Phone: +92 303-5065560</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;

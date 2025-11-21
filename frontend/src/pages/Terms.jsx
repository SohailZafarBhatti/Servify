import React from "react";

const Terms = () => {
  return (
    <div className="bg-gray-50 py-12 px-6 lg:px-20">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl p-10">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Terms & Conditions
        </h1>
        <p className="text-gray-600 mb-10">
          Welcome to Servify! By accessing or using our platform, you agree to
          comply with the following Terms & Conditions. Please read them
          carefully before using our services.
        </p>

        {/* Sections */}
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-600">
              By registering on our platform or using our services, you agree to
              be bound by these Terms & Conditions, along with our Privacy
              Policy. If you do not agree, please discontinue use immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              2. User Responsibilities
            </h2>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-2">
              <li>Provide accurate and complete registration details.</li>
              <li>
                Maintain the confidentiality of your account credentials.
              </li>
              <li>
                Use the platform only for lawful purposes and in compliance with
                regulations.
              </li>
              <li>
                Avoid fraudulent, abusive, or harmful activities that disrupt
                services or harm other users.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              3. Service Provider Responsibilities
            </h2>
            <p className="text-gray-600">
              Service providers are responsible for ensuring that their
              qualifications, pricing, and services offered are accurate and
              legitimate. Providers must comply with local laws and maintain
              professionalism while delivering services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              4. Payments & Transactions
            </h2>
            <p className="text-gray-600">
              you will recieve payments hand on hand and i will in future All transactions must be completed through our secure payment
              channels. Users are responsible for ensuring sufficient funds, and
              disputes will be handled as per our refund policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              5. Limitation of Liability
            </h2>
            <p className="text-gray-600">
              Servify acts as a platform to connect users and service providers.
              We are not liable for any direct or indirect damages, disputes,
              or losses arising from interactions between users and providers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              6. Account Termination
            </h2>
            <p className="text-gray-600">
              We reserve the right to suspend or terminate accounts found in
              violation of these Terms or engaged in fraudulent activities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              7. Changes to Terms
            </h2>
            <p className="text-gray-600">
              Servify may update these Terms & Conditions from time to time. We
              encourage users to review this page regularly for any updates.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              8. Contact Us
            </h2>
            <p className="text-gray-600">
              For questions or concerns about these Terms & Conditions, please
              contact us at:{" "}
              <span className="font-medium text-blue-600 cursor-pointer">
                waleedmeer36@gmail.com
              </span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;

import React from "react";

const Privacy = () => {
  return (
    <div className="bg-gray-50 py-12 px-6 lg:px-20">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl p-10">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Privacy Policy
        </h1>
        <p className="text-gray-600 mb-10">
          Your privacy is important to us. This Privacy Policy explains how we
          collect, use, and protect your personal information when you use our
          platform. Please read it carefully to understand our practices.
        </p>

        {/* Sections */}
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              1. Information We Collect
            </h2>
            <p className="text-gray-600">
              We may collect personal information such as your name, email,
              phone number, location, and payment details when you register or
              use our services. We also collect non-personal data such as
              browser type, device information, and IP address for analytics.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-600">
              The information we collect is used to:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-2">
              <li>Provide and improve our services</li>
              <li>Facilitate secure transactions</li>
              <li>Send important notifications and updates</li>
              <li>Enhance user experience with personalized features</li>
              <li>Ensure compliance with legal requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              3. Sharing of Information
            </h2>
            <p className="text-gray-600">
              We do not sell your personal data. However, we may share
              information with trusted partners, service providers, or when
              required by law. Any third-party access is limited to the purpose
              of providing services on our behalf.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              4. Data Security
            </h2>
            <p className="text-gray-600">
              We implement strict security measures to protect your personal
              data from unauthorized access, alteration, or disclosure. However,
              no method of transmission over the internet is completely secure,
              and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              5. Your Rights
            </h2>
            <p className="text-gray-600">
              You have the right to access, update, or delete your personal
              data. You may also request restrictions on how we process your
              information by contacting our support team.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              6. Updates to This Policy
            </h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or legal requirements. We encourage you
              to review this page periodically for the latest updates.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              7. Contact Us
            </h2>
            <p className="text-gray-600">
              If you have any questions or concerns regarding this Privacy
              Policy, please contact us at:{" "}
              <span className="font-medium text-blue-600 cursor-pointer">
                zsohial6@gmail.com
              </span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;

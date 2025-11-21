import React, { useState } from "react";

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is Servify?",
      answer:
        "Servify is a platform that connects users with trusted service providers in their local area for a variety of tasks.",
    },
    {
      question: "How do I create an account?",
      answer:
        "Simply click on the Register button, provide the required details, and select role your account is created.",
    },
    {
      question: "Is my personal information safe?",
      answer:
        "Yes, we take data security seriously. Your information is encrypted and only shared with service providers when necessary.",
    },
    {
      question: "How do payments work?",
      answer:
        "All payments are hand to hand. In  future all payments are processed through our platform.",
    },
    {
      question: "Can I cancel a task after posting?",
      answer:
        "Yes, users can cancel tasks before they are accepted by a service provider. Cancellation after acceptance may be subject to conditions.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-gray-50 py-12 px-6 lg:px-20">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl p-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Frequently Asked Questions (FAQs)
        </h1>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-b pb-4 cursor-pointer"
              onClick={() => toggleFAQ(index)}
            >
              <h3 className="text-xl font-semibold text-gray-800 flex justify-between items-center">
                {faq.question}
                <span className="text-blue-600">
                  {openIndex === index ? "−" : "+"}
                </span>
              </h3>
              {openIndex === index && (
                <p className="text-gray-600 mt-2">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQs;

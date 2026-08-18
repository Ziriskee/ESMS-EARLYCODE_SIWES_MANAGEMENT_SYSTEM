import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is the SIWES program at Early Code?",
    answer:
      "The Students Industrial Work Experience Scheme (SIWES) at Early Code Institute is a hands-on industrial training program where students from Nigerian universities and polytechnics gain practical experience in software development, data science, and digital technology under the supervision of expert instructors.",
  },
  {
    question: "How long does the SIWES training last?",
    answer:
      "The duration depends on your school's requirements, typically ranging from 4 to 6 months. Your official start and end dates will be set based on your school's SIWES calendar and our organization's schedule.",
  },
  {
    question: "What courses can I do SIWES in?",
    answer:
      "We offer SIWES placements in Web Development, Data Science, UI/UX Design, Mobile App Development, Cybersecurity, and Office Productivity Tools. You can enroll in one or more courses depending on your school's approval and your interests.",
  },
  {
    question: "Do I need to pay for SIWES training?",
    answer:
      "SIWES is designed as part of your academic curriculum. However, some specialized tracks may require a commitment fee. Please contact our front desk or send an email to info@earlycode.net for detailed information about any applicable fees.",
  },
  {
    question: "What is the schedule like?",
    answer:
      "Interns are assigned to specific days and shifts (morning: 8:30 AM – 1:00 PM, or afternoon: 1:00 PM – 6:00 PM). Shift rotation happens automatically every week to ensure fair scheduling. Your exact schedule will be assigned by the admin after registration.",
  },
  {
    question: "Will I receive a certificate after completion?",
    answer:
      "Yes. Upon successful completion of your SIWES program, including submission of all required reports and assessments, you will receive a verifiable certificate from Early Code Institute that can be validated on our website.",
  },
];

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="w-full px-6 py-20 md:py-32 bg-white/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-ec-gold text-sm font-semibold tracking-widest uppercase mb-4 block font-body">
            Got Questions?
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-heading">
            Frequently Asked <span className="text-ec-gold">Questions</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-white/10 rounded-xl overflow-hidden"
            >
              <button
                className="faq-toggle w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-bold text-white pr-4 font-heading">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-ec-gold shrink-0 transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`px-6 pb-5 text-gray-400 leading-relaxed font-body transition-all duration-300 ${openIndex === index ? "block" : "hidden"}`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    number: "01",
    title: "Enroll in a Course",
    description:
      "Visit the Early Code Institute website and enroll in your preferred tech course. Complete the enrollment process and select your specialization.",
  },
  {
    number: "02",
    title: "Payment Verification",
    description:
      "Pay your tuition fee via bank transfer, POS, or cash at our training center. Wait for your payment to be verified by our admin team.",
  },
  {
    number: "03",
    title: "Register for SIWES",
    description:
      "Once payment is confirmed, access the SIWES registration portal. Fill out the application form and upload your school IT letter.",
  },
  {
    number: "04",
    title: "Get Assigned & Start",
    description:
      "Our admin reviews your application, assigns you to an instructor, and schedules your training. You will receive your start date and shift via email.",
  },
];

export default function Steps() {
  return (
    <section id="steps" className="w-full px-6 py-20 md:py-26  bg-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-ec-gold text-sm font-semibold tracking-widest uppercase mb-4 block font-body">
            How to Apply
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-heading">
            Steps to <span className="text-ec-gold">SIWES</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto font-body">
            Follow these steps carefully before applying for your industrial
            training at Early Code Institute.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="group p-8 rounded-2xl border border-white/10 hover:border-ec-gold/50 bg-white/5 hover:bg-white/10 transition-all duration-500 relative"
            >
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-3 w-6 h-0.5 bg-white/10 group-hover:bg-ec-gold/30 transition-colors" />
              )}

              <div className="w-14 h-14 rounded-xl bg-ec-gold/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-ec-gold font-heading">
                  {step.number}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 font-heading">
                {step.title}
              </h3>
              <p className="text-gray-400 leading-relaxed font-body">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Warning / Note */}
        <div className="mt-12 p-6 rounded-2xl border border-ec-gold/20 bg-ec-gold/5 flex items-start gap-4 max-w-3xl mx-auto">
          <div className="w-10 h-10 rounded-full bg-ec-gold/20 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-ec-gold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-white mb-1 font-heading">
              Important Notice
            </h4>
            <p className="text-gray-400 text-sm font-body">
              You must complete course enrollment and payment verification
              before you can register for SIWES. The SIWES registration portal
              will only be accessible after your payment has been confirmed by
              our admin team.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

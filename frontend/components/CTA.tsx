export default function CTA() {
  return (
    <section
      id="cta"
      className="w-full px-6 py-20 md:py-32 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-ec-gold/5" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-ec-gold/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <span className="text-ec-gold text-sm font-semibold tracking-widest uppercase mb-4 block font-body">
          Ready to Begin?
        </span>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-heading">
          Start Your <span className="text-ec-gold">SIWES Journey</span> Today
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-body">
          Remember: You must first enroll in a course on the Early Code website
          and complete payment before you can register for SIWES.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="https://www.earlycode.net/courses"
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-4 bg-ec-gold text-ec-dark rounded-full font-bold text-lg hover:scale-105 hover:shadow-lg hover:shadow-ec-gold/30 transition-all duration-300 font-body"
          >
            Enroll
          </a>
          <a
            href="https://wa.me/2347087777367"
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-4 border-2 border-ec-gold text-ec-gold rounded-full font-bold text-lg hover:bg-ec-gold hover:text-ec-dark transition-all duration-300 font-body"
          >
            Chat on WhatsApp
          </a>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500 font-body">
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-ec-gold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Accredited by NBTE
          </span>
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-ec-gold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Licensed by CPN
          </span>
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-ec-gold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            NCS Corporate Member
          </span>
        </div>
      </div>
    </section>
  );
}

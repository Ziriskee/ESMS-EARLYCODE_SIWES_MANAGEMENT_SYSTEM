// import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative w-full px-6 pt-20 pb-24 md:pt-32 md:pb-40 flex flex-col items-center text-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-ec-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-ec-gold/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-ec-gold/30 bg-ec-gold/10 mb-8">
          <span className="w-2 h-2 rounded-full bg-ec-gold animate-pulse" />
          <span className="text-ec-gold text-sm font-medium font-body">
            SIWES Industrial Training 2026
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 font-heading">
          Launch Your Tech Career With{" "}
          <span className="text-ec-gold">Real-World</span> Experience
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-body">
          Join Early Code Institute&apos;s accredited SIWES program. Gain
          hands-on training in software development, data science, and digital
          skills under expert supervision.
        </p>

        {/* Scroll indicator instead of buttons */}
        <a
          href="#steps"
          className="inline-flex flex-col items-center gap-2 text-gray-400 hover:text-ec-gold transition-colors duration-300 group"
        >
          <span className="text-sm font-medium font-body tracking-wide uppercase">
            Read the steps before applying
          </span>
          <div className="w-8 h-12 rounded-full border-2 border-current flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 bg-current rounded-full animate-bounce mt-1" />
          </div>
          <svg
            className="w-5 h-5 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </a>

        <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-ec-gold font-heading">
              6+
            </div>
            <div className="text-sm text-gray-500 mt-1 font-body">
              Years of Excellence
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-ec-gold font-heading">
              300+
            </div>
            <div className="text-sm text-gray-500 mt-1 font-body">
              Students Trained
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-ec-gold font-heading">
              95%
            </div>
            <div className="text-sm text-gray-500 mt-1 font-body">
              Success Rate
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

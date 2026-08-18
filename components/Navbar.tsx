import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: "Steps", href: "#steps" },
    { label: "Requirements", href: "#requirements" },
    { label: "FAQs", href: "#faqs" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className="w-full px-10 py-5 flex items-center justify-between border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-ec-dark/90">
      
      <div className="flex items-center gap-2">
        <img src="/earlycode_logo.webp" alt="" className="w-10 h-auto" />
        <div className="flex flex-col gap-0">
          <p className="text-xl font-bold tracking-wide uppercase font-nav">
            Early Code
          </p>
          <p className="text-gray-300 text-[10px] tracking-[0.4em] font-nav uppercase">
            Institute
          </p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300 font-body">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="hover:text-ec-gold transition-colors duration-300"
          >
            {link.label}
          </a>
        ))}
      </div>

      <a
        href="/register"
        className="hidden md:inline-flex px-6 py-2.5 bg-ec-gold text-ec-dark rounded-full font-semibold text-sm hover:scale-105 transition-transform duration-300 font-body"
      >
        Apply Now
      </a>

      <button
        className="md:hidden text-white"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-ec-dark border-b border-white/10 px-6 py-4 space-y-4 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block text-gray-300 hover:text-ec-gold"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/register"
            className="inline-block px-6 py-2.5 bg-ec-gold text-ec-dark rounded-full font-semibold text-sm"
            onClick={() => setIsOpen(false)}
          >
            Apply Now
          </Link>
        </div>
      )}
    </nav>
  );
}

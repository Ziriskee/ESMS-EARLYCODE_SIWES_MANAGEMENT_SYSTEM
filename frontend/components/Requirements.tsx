const requirements = [
  {
    icon: (
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    title: "School Introduction Letter",
    description:
      "Official letter from your institution confirming your SIWES placement.",
  },
 
  {
    icon: (
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    title: "ITF Form 8",
    description:
      "Downloaded and filled. Bring to our office for verification and stamping.",
  },
  // {
  //   icon: (
  //     <svg
  //       className="w-5 h-5 text-ec-gold"
  //       fill="none"
  //       stroke="currentColor"
  //       viewBox="0 0 24 24"
  //     >
  //       <path
  //         strokeLinecap="round"
  //         strokeLinejoin="round"
  //         strokeWidth={2}
  //         d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
  //       />
  //     </svg>
  //   ),
  //   title: "Physical Logbook",
  //   description:
  //     "Your school-issued SIWES logbook for daily activity recording.",
  // },
];

const infoCards = [
  {
    icon: (
      <svg
        className="w-6 h-6 text-ec-gold"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Training Duration",
    description: "4 to 6 months (as specified by your school)",
  },
  {
    icon: (
      <svg
        className="w-6 h-6 text-ec-gold"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    title: "Location",
    description: "62 Gado Nasko Rd, Kubwa, Abuja",
  },
  {
    icon: (
      <svg
        className="w-6 h-6 text-ec-gold"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Certification",
    description: "Verifiable completion certificate upon successful training",
  },
];

export default function Requirements() {
  return (
    <section id="requirements" className="w-full px-6 py-20 md:py-32">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-13 items-center">
          <div>
            <span className="text-ec-gold text-sm font-semibold tracking-widest uppercase mb-4 block font-body">
              What You Need
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 font-heading">
              SIWES <span className="text-ec-gold">Requirements</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed font-body">
              Before you begin your industrial training at Early Code Institute,
              ensure you have the following documents and meet the eligibility
              criteria.
            </p>

            <div className="space-y-6">
              {requirements.map((req) => (
                <div
                  key={req.title}
                  className="flex gap-4 items-start p-4 rounded-xl border border-white/10 hover:border-ec-gold/30 transition-colors duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-ec-gold/10 flex items-center justify-center shrink-0">
                    {req.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1 font-heading">
                      {req.title}
                    </h4>
                    <p className="text-gray-400 text-sm font-body">
                      {req.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-16">
            <div className="absolute inset-0 bg-ec-gold/10 rounded-3xl blur-2xl" />
            <div className="relative p-8 rounded-3xl border border-white/10 bg-white/5">
              <div className="space-y-6">
                {infoCards.map((card) => (
                  <div
                    key={card.title}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-ec-gold/20"
                  >
                    <div className="w-12 h-12 rounded-full bg-ec-gold/20 flex items-center justify-center">
                      {card.icon}
                    </div>
                    <div>
                      <div className="font-bold text-white font-heading">
                        {card.title}
                      </div>
                      <div className="text-gray-400 text-sm font-body">
                        {card.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}

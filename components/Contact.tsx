const contacts = [
  {
    icon: (
      <svg className="w-6 h-6 text-ec-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    title: 'General Enquiries',
    links: [
      { type: 'phone' as const, value: '+234 708 777 7367', href: 'tel:+2347087777367' },
      { type: 'email' as const, value: 'info@earlycode.net', href: 'mailto:info@earlycode.net' },
    ],
  },
  {
    icon: (
      <svg className="w-6 h-6 text-ec-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Corporate Partnership',
    links: [
      { type: 'phone' as const, value: '+234 812 665 2819', href: 'tel:+2348126652819' },
      { type: 'email' as const, value: 'ndifreke.ekanem@earlycode.net', href: 'mailto:ndifreke.ekanem@earlycode.net' },
    ],
  },
  {
    icon: (
      <svg className="w-6 h-6 text-ec-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Visit Our Center',
    address: `62 Gado Nasko Rd, Kubwa, 900286,Federal Capital Territory, Abuja, Nigeria`,
  },
];

export default function Contact() {
  return (
    <section id="contact" className="w-full px-6 py-20 md:py-32 bg-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-ec-gold text-sm font-semibold tracking-widest uppercase mb-4 block font-body">
            Get In Touch
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-heading">
            Contact <span className="text-ec-gold">Us</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact) => (
            <div
              key={contact.title}
              className="p-8 rounded-2xl border border-white/10 bg-white/5 hover:border-ec-gold/30 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-ec-gold/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {contact.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 font-heading">{contact.title}</h3>
              {'address' in contact ? (
                <p className="text-gray-400 leading-relaxed font-body whitespace-pre-line">
                  {contact.address}
                </p>
              ) : (
                <div className="space-y-3 text-gray-400 font-body">
                  {contact.links?.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 hover:text-ec-gold transition-colors"
                    >
                      {link.type === 'phone' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                      {link.value}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
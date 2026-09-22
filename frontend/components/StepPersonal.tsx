import { Field, ErrorMessage } from "formik";

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export default function StepPersonal() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 font-heading">
        Personal Information
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm text-ec-gold font-semibold font-body">
            Email *
          </label>
          <Field
            name="email"
            type="email"
            autoComplete="email"
            placeholder="john@example.com"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
          />
          <ErrorMessage
            name="email"
            component="p"
            className="text-red-400 text-sm font-body"
          />
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <label className="text-sm text-ec-gold font-semibold font-body">
            Full Name *
          </label>
          <Field
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="John Doe"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
          />
          <ErrorMessage
            name="fullName"
            component="p"
            className="text-red-400 text-sm font-body"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-sm text-ec-gold font-semibold font-body">
            Phone Number *
          </label>
          <Field
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+234 801 234 5678"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
          />
          <ErrorMessage
            name="phone"
            component="p"
            className="text-red-400 text-sm font-body"
          />
        </div>

        {/* State of Origin */}
        <div className="space-y-2">
          <label className="text-sm text-ec-gold font-semibold font-body">
            State of Origin *
          </label>
          <Field
            name="stateOfOrigin"
            type="text"
            autoComplete="address-level1"
            placeholder="e.g., Lagos"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
          />
          <ErrorMessage
            name="stateOfOrigin"
            component="p"
            className="text-red-400 text-sm font-body"
          />
        </div>

        {/* Gender — pill grid */}
        <div className="space-y-2">
          <label className="text-sm text-ec-gold font-semibold font-body">
            Gender *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {GENDERS.map((g) => (
              <label
                key={g.value}
                className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-white/10 hover:border-ec-gold/50 transition-colors"
              >
                <Field
                  type="radio"
                  name="gender"
                  value={g.value}
                  className="accent-ec-gold w-4 h-4"
                />
                <span className="text-white text-sm font-body">{g.label}</span>
              </label>
            ))}
          </div>
          <ErrorMessage
            name="gender"
            component="p"
            className="text-red-400 text-sm font-body"
          />
        </div>

        {/* Address */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-ec-gold font-semibold font-body">
            Address *
          </label>
          <Field
            name="address"
            as="textarea"
            rows={3}
            autoComplete="street-address"
            placeholder="Your residential address"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body resize-none"
          />
          <ErrorMessage
            name="address"
            component="p"
            className="text-red-400 text-sm font-body"
          />
        </div>
      </div>
    </div>
  );
}

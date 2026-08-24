import { Field, ErrorMessage, useFormikContext } from "formik";
import type { FormValues } from "./RegisterForm";

export default function StepSchool() {
  const { values } = useFormikContext<FormValues>();

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold mb-6 font-heading">
        School Information
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Preferred Campus */}
        <div className="space-y-2">
          <label className="text-sm text-ec-gold font-semibold font-body">
            Preferred Early Code Campus *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <Field
                type="radio"
                name="preferredCampus"
                value="kubwa"
                className="accent-ec-gold w-4 h-4"
              />
              <span className="text-white font-body">Kubwa Campus</span>
            </label>
            
          </div>
          <ErrorMessage
            name="preferredCampus"
            component="p"
            className="text-red-400 text-sm font-body"
          />
        </div>

        {/* Current Institution */}
        <div className="space-y-2">
          <label className="text-sm text-ec-gold font-semibold font-body">
            Current Institution *
          </label>
          <Field
            name="currentInstitution"
            type="text"
            placeholder="University of Lagos"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
          />
          <ErrorMessage
            name="currentInstitution"
            component="p"
            className="text-red-400 text-sm font-body"
          />
        </div>

        {/* Institution Address */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-ec-gold font-semibold font-body">
            Institution's Address *
          </label>
          <Field
            name="institutionAddress"
            type="text"
            placeholder="Full address of your institution"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
          />
          <ErrorMessage
            name="institutionAddress"
            component="p"
            className="text-red-400 text-sm font-body"
          />
        </div>

        {/* Course of Study */}
        <div className="space-y-2">
          <label className="text-sm text-ec-gold font-semibold font-body">
            Course of Study *
          </label>
          <Field
            name="courseOfStudy"
            type="text"
            placeholder="Software Engineering"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
          />
          <ErrorMessage
            name="courseOfStudy"
            component="p"
            className="text-red-400 text-sm font-body"
          />
        </div>

        {/* Current Level */}
        <div className="space-y-2">
          <label className="text-sm text-ec-gold font-semibold font-body">
            Current Level *
          </label>
          <Field
            name="currentLevel"
            as="select"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body appearance-none"
          >
            <option value="" className="bg-ec-dark">
              Select Level
            </option>
            <option value="100" className="bg-ec-dark">
              100 Level
            </option>
            <option value="200" className="bg-ec-dark">
              200 Level
            </option>
            <option value="300" className="bg-ec-dark">
              300 Level
            </option>
            <option value="400" className="bg-ec-dark">
              400 Level
            </option>
            <option value="500" className="bg-ec-dark">
              500 Level
            </option>
          </Field>
          <ErrorMessage
            name="currentLevel"
            component="p"
            className="text-red-400 text-sm font-body"
          />
        </div>

        {/* Matric Number */}
        <div className="space-y-2">
          <label className="text-sm text-ec-gold font-semibold font-body">
            Matriculation Number *
          </label>
          <Field
            name="matricNumber"
            type="text"
            placeholder="e.g., 190805020"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
          />
          <ErrorMessage
            name="matricNumber"
            component="p"
            className="text-red-400 text-sm font-body"
          />
        </div>

        {/* Internship Start Date */}
        <div className="space-y-2">
          <label className="text-sm text-ec-gold font-semibold font-body">
            Internship Start Date *
          </label>
          <Field
            name="internshipStartDate"
            type="date"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
          />
          <ErrorMessage
            name="internshipStartDate"
            component="p"
            className="text-red-400 text-sm font-body"
          />
        </div>

        {/* Internship End Date */}
        <div className="space-y-2">
          <label className="text-sm text-ec-gold font-semibold font-body">
            Internship End Date *
          </label>
          <Field
            name="internshipEndDate"
            type="date"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
          />
          <ErrorMessage
            name="internshipEndDate"
            component="p"
            className="text-red-400 text-sm font-body"
          />
        </div>

        {/* Internship Duration */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-ec-gold font-semibold font-body">
            Internship Duration *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              "1 Month",
              "2 Months",
              "3 Months",
              "4 Months",
              "5 Months",
              "6 Months",
              "Other",
            ].map((dur) => (
              <label
                key={dur}
                className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-white/10 hover:border-ec-gold/50 transition-colors"
              >
                <Field
                  type="radio"
                  name="internshipDuration"
                  value={dur.toLowerCase().replace(" ", "-")}
                  className="accent-ec-gold w-4 h-4"
                />
                <span className="text-white text-sm font-body">{dur}</span>
              </label>
            ))}
          </div>
          <ErrorMessage
            name="internshipDuration"
            component="p"
            className="text-red-400 text-sm font-body"
          />

          {/* Conditional Other Duration Input */}
          {values.internshipDuration === "other" && (
            <div className="mt-4 animate-fadeIn">
              <label className="text-sm text-ec-gold font-semibold font-body">
                Specify Duration *
              </label>
              <Field
                name="otherDuration"
                type="text"
                placeholder="e.g., 8 Months, 1 Year"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
              />
              <ErrorMessage
                name="otherDuration"
                component="p"
                className="text-red-400 text-sm font-body mt-1"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

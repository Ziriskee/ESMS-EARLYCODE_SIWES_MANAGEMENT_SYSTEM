import { Field, ErrorMessage, useFormikContext } from "formik";
import type { FormValues } from "./RegisterForm";

const courseOptions = [
  "Web Development in React and Next JS",
  "Web Design Masterclass [Tailwind CSS]",
  "Python with Data Science",
  "Python Bootcamp",
  "Data Analytics",
  "UI/UX and Prototype Design",
  "Office Essentials Plus",
  "Android and iOS Development",
  "TypeScript Bootcamp",
  "Cybersecurity Analyst",
  "Cybersecurity [CC]",
  "Office Essentials",
];

export default function StepAdditional() {
  const { values, setFieldValue } = useFormikContext<FormValues>();

  const toggleCourse = (course: string) => {
    const current = values.chosenCourses;
    if (current.includes(course)) {
      setFieldValue(
        "chosenCourses",
        current.filter((c) => c !== course),
      );
    } else {
      setFieldValue("chosenCourses", [...current, course]);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold mb-6 font-heading">
        Additional Details
      </h2>

      {/* Chosen Courses - Multi Select */}
      <div className="space-y-3">
        <label className="text-sm text-ec-gold font-semibold font-body">
          Chosen Course For Internship *
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          {courseOptions.map((course) => (
            <label
              key={course}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                values.chosenCourses.includes(course)
                  ? "border-ec-gold bg-ec-gold/10"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <input
                type="checkbox"
                checked={values.chosenCourses.includes(course)}
                onChange={() => toggleCourse(course)}
                className="accent-ec-gold w-4 h-4 shrink-0"
              />
              <span className="text-white text-sm font-body">{course}</span>
            </label>
          ))}
        </div>
        <ErrorMessage
          name="chosenCourses"
          component="p"
          className="text-red-400 text-sm font-body"
        />
      </div>

      {/* Why Intern */}
      <div className="space-y-2">
        <label className="text-sm text-ec-gold font-semibold font-body">
          Why do you want to intern at Early Code Ltd? *
        </label>
        <Field
          name="whyIntern"
          as="textarea"
          rows={4}
          placeholder="Tell us why you chose Early Code for your SIWES..."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body resize-none"
        />
        <ErrorMessage
          name="whyIntern"
          component="p"
          className="text-red-400 text-sm font-body"
        />
      </div>

      {/* Emergency Contact */}
      <div className="space-y-2">
        <label className="text-sm text-ec-gold font-semibold font-body">
          Emergency Contact *
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <Field
              type="radio"
              name="emergencyContact"
              value="father"
              className="accent-ec-gold w-4 h-4"
            />
            <span className="text-white font-body">Father</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Field
              type="radio"
              name="emergencyContact"
              value="mother"
              className="accent-ec-gold w-4 h-4"
            />
            <span className="text-white font-body">Mother</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Field
              type="radio"
              name="emergencyContact"
              value="guardian"
              className="accent-ec-gold w-4 h-4"
            />
            <span className="text-white font-body">Guardian</span>
          </label>
        </div>
        <ErrorMessage
          name="emergencyContact"
          component="p"
          className="text-red-400 text-sm font-body"
        />
      </div>

      {/* Emergency Phone */}
      <div className="space-y-2">
        <label className="text-sm text-ec-gold font-semibold font-body">
          Emergency Contact Phone Number *
        </label>
        <Field
          name="emergencyPhone"
          type="tel"
          placeholder="+234 801 234 5678"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
        />
        <ErrorMessage
          name="emergencyPhone"
          component="p"
          className="text-red-400 text-sm font-body"
        />
      </div>

      {/* Declaration */}
      <div className="space-y-2">
        <label className="text-sm text-ec-gold font-semibold font-body">
          Declaration [Name and Date] *
        </label>
        <p className="text-gray-400 text-sm font-body">
          "I hereby declare that the information provided above is true and I
          agree to abide by the rules and regulations of Early Code Ltd upon
          acceptance."
        </p>
        <Field
          name="declaration"
          type="text"
          placeholder="Type your full name and today's date"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
        />
        <ErrorMessage
          name="declaration"
          component="p"
          className="text-red-400 text-sm font-body"
        />
      </div>
    </div>
  );
}

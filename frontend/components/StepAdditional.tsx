import { useState, useEffect } from "react";
import { ErrorMessage, useFormikContext } from "formik";
import MultiSelect from "./MultiSelect";
import { apiFetch } from "@/lib/api";

interface Course {
  id: string;
  course_name: string;
  course_code?: string;
  duration?: string;
  is_active: boolean;
}



export default function StepAdditional() {
  const { values, errors, touched, setFieldValue } = useFormikContext<{
    chosenCourses: string[];
    whyIntern: string;
    emergencyContact: string;
    emergencyPhone: string;
    declaration: string;
  }>();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [courseLoadError, setCourseLoadError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiFetch<Course[] | { results?: Course[] }>(
          "courses/",
        ).catch(() => {
          throw new Error("Could not load courses.");
        });
        const courseList: Course[] = Array.isArray(data)
          ? data
          : data.results || [];

        setCourses(courseList);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not load courses.";
        setCourseLoadError(message);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="space-y-8">
      {/* Chosen Courses — MultiSelect dropdown */}
      <div className="space-y-3">
        <label className="text-sm text-ec-gold font-semibold font-body">
          Chosen Course For Internship *
        </label>

        {loadingCourses ? (
          <p className="text-sm text-gray-400 font-body">Loading courses...</p>
        ) : courseLoadError ? (
          <p className="text-sm text-red-400 font-body">{courseLoadError}</p>
        ) : (
          <MultiSelect
            options={courses.map((c) => ({
              value: c.id,
              label: c.course_name,
              sublabel: c.course_code,
              timeframe: c.duration,
            }))}
            values={values.chosenCourses || []}
            onChange={(next) => setFieldValue("chosenCourses", next)}
            placeholder="Select course(s)"
            emptyMessage="No courses available. Please contact the admin."
          />
        )}

        <ErrorMessage
          name="chosenCourses"
          component="p"
          className="text-red-400 text-sm font-body"
        />
      </div>

      {/* Why Intern */}
      <div className="space-y-2">
        <label className="text-sm text-ec-gold font-semibold font-body">
          Why do you want to intern with EarlyCode? *
        </label>
        <textarea
          name="whyIntern"
          value={values.whyIntern}
          onChange={(e) => setFieldValue("whyIntern", e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body resize-none"
          placeholder="Tell us why you chose EarlyCode for your SIWES..."
        />
        {errors.whyIntern && touched.whyIntern && (
          <p className="text-sm text-red-400 font-body">{errors.whyIntern}</p>
        )}
      </div>

      {/* Emergency Contact */}
      <div className="space-y-2">
        <label className="text-sm text-ec-gold font-semibold font-body">
          Emergency Contact Type *
        </label>
        <select
          name="emergencyContact"
          value={values.emergencyContact}
          onChange={(e) => setFieldValue("emergencyContact", e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body appearance-none"
        >
          <option value="" className="bg-ec-dark">
            Select contact type
          </option>
          <option value="parent" className="bg-ec-dark">
            Parent
          </option>
          <option value="guardian" className="bg-ec-dark">
            Guardian
          </option>
          <option value="sibling" className="bg-ec-dark">
            Sibling
          </option>
          <option value="spouse" className="bg-ec-dark">
            Spouse
          </option>
          <option value="friend" className="bg-ec-dark">
            Friend
          </option>
          <option value="other" className="bg-ec-dark">
            Other
          </option>
        </select>
        {errors.emergencyContact && touched.emergencyContact && (
          <p className="text-sm text-red-400 font-body">
            {errors.emergencyContact}
          </p>
        )}
      </div>

      {/* Emergency Phone */}
      <div className="space-y-2">
        <label className="text-sm text-ec-gold font-semibold font-body">
          Emergency Contact Phone *
        </label>
        <input
          type="tel"
          name="emergencyPhone"
          autoComplete="tel"
          value={values.emergencyPhone}
          onChange={(e) => setFieldValue("emergencyPhone", e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
          placeholder="+234 801 234 5678"
        />
        {errors.emergencyPhone && touched.emergencyPhone && (
          <p className="text-sm text-red-400 font-body">
            {errors.emergencyPhone}
          </p>
        )}
      </div>

      {/* Declaration */}
      <div className="space-y-2">
        <label className="text-sm text-ec-gold font-semibold font-body">
          Declaration *
        </label>
        <textarea
          name="declaration"
          value={values.declaration}
          onChange={(e) => setFieldValue("declaration", e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body resize-none"
          placeholder="I hereby declare that all information provided is true and accurate..."
        />
        {errors.declaration && touched.declaration && (
          <p className="text-sm text-red-400 font-body">{errors.declaration}</p>
        )}
      </div>
    </div>
  );
}

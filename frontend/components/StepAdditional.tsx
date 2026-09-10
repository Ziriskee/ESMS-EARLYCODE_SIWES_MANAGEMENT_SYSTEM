import { useState, useEffect } from "react";
import { ErrorMessage, useFormikContext } from "formik";

interface Course {
  id: string;
  course_name: string;
  course_code?: string;
  category?: string;
  is_active: boolean;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

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
        const response = await fetch(`${API_BASE_URL}/courses/`);
        if (!response.ok) throw new Error("Could not load courses.");
        const data = await response.json();

        // Handle both: array or {results: [...]} (DRF pagination)
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

  const toggleCourse = (courseId: string) => {
    const currentCourses: string[] = values.chosenCourses || [];
    if (currentCourses.includes(courseId)) {
      setFieldValue(
        "chosenCourses",
        currentCourses.filter((id) => id !== courseId),
      );
    } else {
      setFieldValue("chosenCourses", [...currentCourses, courseId]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Chosen Courses - Multi Select */}
      <div className="space-y-3">
        <label className="text-sm text-ec-gold font-semibold font-body">
          Chosen Course For Internship *
        </label>

        {loadingCourses && (
          <p className="text-sm text-gray-400 font-body">Loading courses...</p>
        )}

        {courseLoadError && (
          <p className="text-sm text-red-400 font-body">{courseLoadError}</p>
        )}

        {!loadingCourses && courses.length === 0 && !courseLoadError && (
          <p className="text-sm text-gray-400 font-body">
            No courses available. Please contact the admin.
          </p>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          {courses.map((course) => {
            const selected = values.chosenCourses?.includes(course.id);
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => toggleCourse(course.id)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  selected
                    ? "border-ec-gold bg-ec-gold/10"
                    : "border-white/10 bg-white/5 hover:border-white/30"
                }`}
              >
                <p className="font-semibold text-white font-body">
                  {course.course_name}
                </p>
                {course.course_code && (
                  <p className="text-sm text-gray-400 font-body">
                    {course.course_code}
                  </p>
                )}
                {course.category && (
                  <p className="text-sm text-gray-500 font-body">
                    {course.category}
                  </p>
                )}
              </button>
            );
          })}
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
          Why do you want to intern with EarlyCode? *
        </label>
        <textarea
          name="whyIntern"
          value={values.whyIntern}
          onChange={(e) => setFieldValue("whyIntern", e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-gray-600 bg-[#2A2A2B] px-4 py-3 text-white placeholder-gray-500 focus:border-[#FBCD15] focus:outline-none font-body"
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
          className="w-full rounded-lg border border-gray-600 bg-[#2A2A2B] px-4 py-3 text-white focus:border-[#FBCD15] focus:outline-none font-body"
        >
          <option value="">Select contact type</option>
          <option value="parent">Parent</option>
          <option value="guardian">Guardian</option>
          <option value="sibling">Sibling</option>
          <option value="spouse">Spouse</option>
          <option value="friend">Friend</option>
          <option value="other">Other</option>
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
          value={values.emergencyPhone}
          onChange={(e) => setFieldValue("emergencyPhone", e.target.value)}
          className="w-full rounded-lg border border-gray-600 bg-[#2A2A2B] px-4 py-3 text-white placeholder-gray-500 focus:border-[#FBCD15] focus:outline-none font-body"
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
          className="w-full rounded-lg border border-gray-600 bg-[#2A2A2B] px-4 py-3 text-white placeholder-gray-500 focus:border-[#FBCD15] focus:outline-none font-body"
          placeholder="I hereby declare that all information provided is true and accurate..."
        />
        {errors.declaration && touched.declaration && (
          <p className="text-sm text-red-400 font-body">{errors.declaration}</p>
        )}
      </div>
    </div>
  );
}

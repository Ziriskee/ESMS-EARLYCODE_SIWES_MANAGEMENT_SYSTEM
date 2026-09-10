import { useState, useEffect, useRef } from "react";
import { Formik, Form, type FormikErrors, type FormikTouched } from "formik";
import * as Yup from "yup";
import StepPersonal from "./StepPersonal";
import StepSchool from "./StepSchool";
import StepAdditional from "./StepAdditional";
import { useNavigate } from "react-router-dom";

export interface FormValues {
  // Step 1: Personal
  email: string;
  fullName: string;
  gender: string;
  address: string;
  phone: string;
  stateOfOrigin: string;

  // Step 2: School
  preferredCampus: string;
  currentInstitution: string;
  institutionAddress: string;
  courseOfStudy: string;
  currentLevel: string;
  matricNumber: string;
  internshipStartDate: string;
  internshipEndDate: string;
  internshipDuration: string;
  otherDuration: string;

  // Step 3: Additional
  chosenCourses: string[];
  whyIntern: string;
  emergencyContact: string;
  emergencyPhone: string;
  declaration: string;
}

const defaultInitialValues: FormValues = {
  email: "",
  fullName: "",
  gender: "",
  address: "",
  phone: "",
  stateOfOrigin: "",
  preferredCampus: "",
  currentInstitution: "",
  institutionAddress: "",
  courseOfStudy: "",
  currentLevel: "",
  matricNumber: "",
  internshipStartDate: "",
  internshipEndDate: "",
  internshipDuration: "",
  otherDuration: "",
  chosenCourses: [],
  whyIntern: "",
  emergencyContact: "",
  emergencyPhone: "",
  declaration: "",
};

const STORAGE_KEY_DATA = "siwes_form_data";
const STORAGE_KEY_STEP = "siwes_form_step";

function getSavedData(): { values: FormValues; step: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DATA);
    const stepRaw = localStorage.getItem(STORAGE_KEY_STEP);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      values: { ...defaultInitialValues, ...parsed },
      step: stepRaw ? parseInt(stepRaw, 10) : 1,
    };
  } catch {
    return null;
  }
}

const steps = [
  { number: 1, title: "Personal Information" },
  { number: 2, title: "School Information" },
  { number: 3, title: "Additional Details" },
];

const step1Schema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  fullName: Yup.string().required("Full name is required"),
  gender: Yup.string().required("Gender is required"),
  address: Yup.string().required("Address is required"),
  phone: Yup.string().required("Phone number is required"),
  stateOfOrigin: Yup.string().required("State of origin is required"),
});

const step2Schema = Yup.object({
  preferredCampus: Yup.string().required("Preferred campus is required"),
  currentInstitution: Yup.string().required("Institution is required"),
  institutionAddress: Yup.string().required("Institution address is required"),
  courseOfStudy: Yup.string().required("Course of study is required"),
  currentLevel: Yup.string().required("Current level is required"),
  matricNumber: Yup.string().required("Matric number is required"),
  internshipStartDate: Yup.string().required("Start date is required"),
  internshipEndDate: Yup.string().required("End date is required"),
  internshipDuration: Yup.string().required("Duration is required"),
  otherDuration: Yup.string().when("internshipDuration", {
    is: "other",
    then: (schema) => schema.required("Please specify your duration"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const step3Schema = Yup.object({
  chosenCourses: Yup.array()
    .of(Yup.string().required())
    .min(1, "Select at least one course")
    .required("Select at least one course"),
  whyIntern: Yup.string().required("This field is required"),
  emergencyContact: Yup.string().required("Emergency contact is required"),
  emergencyPhone: Yup.string().required("Emergency phone is required"),
  declaration: Yup.string().required("Declaration is required"),
});

const validationSchemas = [step1Schema, step2Schema, step3Schema];

/* Auto-save component: watches Formik values and saves to localStorage */
function AutoSave({
  values,
  currentStep,
}: {
  values: FormValues;
  currentStep: number;
}) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(values));
      localStorage.setItem(STORAGE_KEY_STEP, String(currentStep));
    }, 500);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [values, currentStep]);

  return null;
}

export default function RegisterForm() {
  const saved = getSavedData();
  const [currentStep, setCurrentStep] = useState(saved?.step ?? 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftRestored] = useState(!!saved);
  const navigate = useNavigate();
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const initialValues = saved?.values ?? defaultInitialValues;

  const handleNext = async (
    validateForm: () => Promise<FormikErrors<FormValues>>,
    setTouched: (
      touched: FormikTouched<FormValues>,
      shouldValidate?: boolean,
    ) => void,
  ) => {
    const errors = await validateForm();
    if (Object.keys(errors).length === 0) {
      setCurrentStep((prev) => prev + 1);
    } else {
      const currentSchemaFields = Object.keys(
        validationSchemas[currentStep - 1].fields,
      );
      const touchFields: Record<string, boolean> = {};
      currentSchemaFields.forEach((field) => {
        touchFields[field] = true;
      });
      setTouched(touchFields as FormikTouched<FormValues>, false);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const [firstName, ...rest] = values.fullName.trim().split(" ");
      const lastName = rest.join(" ") || "";

      const payload = {
        email: values.email,
        first_name: firstName,
        last_name: lastName,
        phone: values.phone,
        role: "INTERN",
        gender: values.gender,
        address: values.address,
        state_of_origin: values.stateOfOrigin,
        preferred_campus: values.preferredCampus,
        current_institution: values.currentInstitution,
        institution_address: values.institutionAddress,
        course_of_study: values.courseOfStudy,
        current_level: values.currentLevel,
        matric_number: values.matricNumber,
        school_start_date: values.internshipStartDate,
        org_end_date: values.internshipEndDate,
        internship_duration: values.internshipDuration,
        other_duration: values.otherDuration,
        why_intern: values.whyIntern,
        emergency_contact_type: values.emergencyContact,
        emergency_phone: values.emergencyPhone,
        declaration: values.declaration,
        chosen_courses: values.chosenCourses,
      };

      const response = await fetch("http://localhost:8000/api/auth/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg =
          data.detail ||
          data.message ||
          (typeof data === "object"
            ? JSON.stringify(data)
            : "Registration failed");
        throw new Error(errorMsg);
      }

      setSubmitStatus({
        type: "success",
        message: "Registration successful! Check your email for a login link.",
      });
      localStorage.removeItem(STORAGE_KEY_DATA);
      localStorage.removeItem(STORAGE_KEY_STEP);

      setTimeout(() => {
        navigate("/login")
      }, 3000);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      setSubmitStatus({ type: "error", message });
      setIsSubmitting(false);
    } 
  };
  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY_DATA);
    localStorage.removeItem(STORAGE_KEY_STEP);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-ec-dark">
      {/* Header */}
      <div className="w-full px-6 py-5 border-b border-white/10 bg-ec-dark/90">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/earlycode_logo.webp"
              alt="earlycode logo"
              className="h-auto w-10"
            ></img>
            <span className="text-xl font-semibold tracking-tight font-heading">
              Early Code
            </span>
          </a>
          <span className="text-sm text-gray-400 font-body">
            SIWES Registration
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <span className="text-ec-gold text-sm font-semibold tracking-widest uppercase mb-4 block font-body">
            Application Form
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white font-heading">
            SIWES <span className="text-ec-gold">Registration</span>
          </h1>
          <p className="text-gray-400 mt-4 font-body">
            Complete all steps to register for your industrial training with
            EarlyCode.
          </p>
        </div>

        {/* Draft Restored Banner */}
        {draftRestored && (
          <div className="mb-6 p-4 rounded-xl border border-ec-gold/30 bg-ec-gold/10 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-ec-gold shrink-0"
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
              <span className="text-ec-gold text-sm font-body">
                Your previous progress was restored. You can continue where you
                left off.
              </span>
            </div>
            <button
              onClick={clearDraft}
              className="text-xs text-gray-400 hover:text-white underline font-body shrink-0 ml-4"
            >
              Start Over
            </button>
          </div>
        )}

        {/* Submit Status Banner */}
        {submitStatus && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-fadeIn ${
              submitStatus.type === "success"
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {submitStatus.type === "success" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              )}
            </svg>
            <span className="text-sm font-body">{submitStatus.message}</span>
          </div>
        )}  

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-ec-gold -translate-y-1/2 transition-all duration-500"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              }}
            />
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative z-10 flex flex-col items-center gap-2"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    step.number <= currentStep
                      ? "bg-ec-gold text-ec-dark"
                      : "bg-white/10 text-gray-400 border border-white/20"
                  }`}
                >
                  {step.number}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block font-body ${
                    step.number <= currentStep
                      ? "text-ec-gold"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchemas[currentStep - 1]}
          onSubmit={handleSubmit}
          validateOnChange={false}
          validateOnBlur={true}
          enableReinitialize={false}
        >
          {({ validateForm, setTouched, values }) => (
            <Form>
              <AutoSave values={values} currentStep={currentStep} />

              <div className="p-8 md:p-10 rounded-3xl border border-white/10 bg-white/5">
                {currentStep === 1 && <StepPersonal />}
                {currentStep === 2 && <StepSchool />}
                {currentStep === 3 && <StepAdditional />}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-8 mt-8 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    disabled={currentStep === 1}
                    className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 font-body ${
                      currentStep === 1
                        ? "bg-white/5 text-gray-500 cursor-not-allowed"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    Back
                  </button>

                  <span className="text-sm text-gray-500 font-body">
                    Step {currentStep} of {steps.length}
                  </span>

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => handleNext(validateForm, setTouched)}
                      className="px-8 py-3 bg-ec-gold text-ec-dark rounded-full font-bold text-sm hover:scale-105 hover:shadow-lg hover:shadow-ec-gold/20 transition-all duration-300 font-body"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-ec-gold text-ec-dark rounded-full font-bold text-sm hover:scale-105 hover:shadow-lg hover:shadow-ec-gold/20 transition-all duration-300 font-body flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </Form>
          )}
        </Formik>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="text-gray-400 hover:text-ec-gold transition-colors text-sm font-body"
          >
            &larr; Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

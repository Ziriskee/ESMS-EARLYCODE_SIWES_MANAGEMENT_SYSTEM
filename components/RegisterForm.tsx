"use client"
import { useState } from 'react';

interface FormData {
  // Step 1: Personal Information
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;

  // Step 2: School Information
  institutionName: string;
  matricNumber: string;
  department: string;
  courseOfStudy: string;
  level: string;
  schoolStartDate: string;
  schoolEndDate: string;
  itLetter: File | null;

  // Step 3: Additional (placeholder)
  additionalNotes: string;
}

const initialFormData: FormData = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  institutionName: '',
  matricNumber: '',
  department: '',
  courseOfStudy: '',
  level: '',
  schoolStartDate: '',
  schoolEndDate: '',
  itLetter: null,
  additionalNotes: '',
};

const steps = [
  { number: 1, title: 'Personal Information' },
  { number: 2, title: 'School Information' },
  { number: 3, title: 'Additional Details' },
];

export default function RegisterForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof FormData, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // TODO: Send formData to your Django API
    console.log('Submitting:', formData);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    alert('Application submitted successfully!');
  };

  const isStepValid = () => {
    if (currentStep === 1) {
      return formData.fullName && formData.email && formData.phone && formData.gender;
    }
    if (currentStep === 2) {
      return formData.institutionName && formData.matricNumber && formData.department && formData.courseOfStudy && formData.level;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-ec-dark">
      {/* Header */}
      <div className="w-full px-6 py-5 border-b border-white/10 bg-ec-dark/90">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-ec-gold flex items-center justify-center text-ec-dark font-bold text-lg font-heading">
              EC
            </div>
            <span className="text-xl font-semibold tracking-tight font-heading">Early Code</span>
          </a>
          <span className="text-sm text-gray-400 font-body">SIWES Registration</span>
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
            Complete all steps to register for your industrial training with EarlyCode.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-ec-gold -translate-y-1/2 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step) => (
              <div key={step.number} className="relative z-10 flex flex-col items-center gap-2">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    step.number <= currentStep 
                      ? 'bg-ec-gold text-ec-dark' 
                      : 'bg-white/10 text-gray-400 border border-white/20'
                  }`}
                >
                  {step.number}
                </div>
                <span 
                  className={`text-xs font-medium hidden sm:block font-body ${
                    step.number <= currentStep ? 'text-ec-gold' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="p-8 md:p-10 rounded-3xl border border-white/10 bg-white/5">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold mb-6 font-heading">Personal Information</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-amber-300 font-semibold font-body">Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-amber-300 font-semibold font-body">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-amber-300 font-semibold font-body">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
                    placeholder="+234 801 234 5678"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-amber-300 font-semibold font-body">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-amber-300 font-semibold font-body">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body appearance-none"
                  >
                    <option value="" className="bg-ec-dark">Select Gender</option>
                    <option value="male" className="bg-ec-dark">Male</option>
                    <option value="female" className="bg-ec-dark">Female</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-amber-300 font-semibold font-body">Home Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body resize-none"
                    placeholder="Your residential address"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: School Information */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold mb-6 font-heading">School Information</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-amber-300 font-semibold font-body">Institution Name *</label>
                  <input
                    type="text"
                    value={formData.institutionName}
                    onChange={(e) => updateField('institutionName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
                    placeholder="University of Lagos"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-amber-300 font-semibold font-body">Matric Number *</label>
                  <input
                    type="text"
                    value={formData.matricNumber}
                    onChange={(e) => updateField('matricNumber', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
                    placeholder="e.g., 190805020"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-amber-300 font-semibold font-body">Department / Faculty *</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => updateField('department', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
                    placeholder="Computer Science"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-amber-300 font-semibold font-body">Course of Study *</label>
                  <input
                    type="text"
                    value={formData.courseOfStudy}
                    onChange={(e) => updateField('courseOfStudy', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
                    placeholder="Software Engineering"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-amber-300 font-semibold font-body">Current Level *</label>
                  <select
                    value={formData.level}
                    onChange={(e) => updateField('level', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body appearance-none"
                  >
                    <option value="" className="bg-ec-dark">Select Level</option>
                    <option value="200" className="bg-ec-dark">200 Level</option>
                    <option value="300" className="bg-ec-dark">300 Level</option>
                    <option value="400" className="bg-ec-dark">400 Level</option>
                    <option value="500" className="bg-ec-dark">500 Level</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-amber-300 font-semibold font-body">School IT Start Date *</label>
                  <input
                    type="date"
                    value={formData.schoolStartDate}
                    onChange={(e) => updateField('schoolStartDate', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-amber-300 font-semibold font-body">School IT End Date *</label>
                  <input
                    type="date"
                    value={formData.schoolEndDate}
                    onChange={(e) => updateField('schoolEndDate', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-amber-300 font-semibold font-body">Upload IT Letter (PDF)</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => updateField('itLetter', e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-ec-gold file:text-ec-dark hover:file:bg-ec-gold/90 transition-colors font-body"
                    />
                  </div>
                  <p className="text-xs text-gray-500 font-body">Upload your school IT letter or introduction letter (PDF, DOC, DOCX)</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Additional Details (Placeholder) */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold mb-6 font-heading">Additional Details</h2>

              <div className="p-8 rounded-2xl border border-ec-gold/20 bg-ec-gold/5 text-center">
                <div className="w-16 h-16 rounded-full bg-ec-gold/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-ec-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 font-heading">More Fields Coming Soon</h3>
                <p className="text-gray-400 font-body max-w-md mx-auto">
                  This section will include additional information required for your SIWES registration. 
                  Stay tuned for updates.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-amber-300 font-semibold font-body">Additional Notes (Optional)</label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => updateField('additionalNotes', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-ec-gold focus:outline-none focus:ring-1 focus:ring-ec-gold transition-colors font-body resize-none"
                  placeholder="Any additional information you'd like us to know..."
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-white/10">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-3 md:px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 font-body ${
                currentStep === 1
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Back
            </button>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-body">
                Step {currentStep} of {steps.length}
              </span>
            </div>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`px-4 md:px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 font-body ${
                  isStepValid()
                    ? 'bg-ec-gold text-ec-dark hover:scale-105 hover:shadow-lg hover:shadow-ec-gold/20'
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next 
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-ec-gold text-ec-dark rounded-full font-bold text-sm hover:scale-105 hover:shadow-lg hover:shadow-ec-gold/20 transition-all duration-300 font-body flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <a href="/" className="text-gray-400 hover:text-ec-gold transition-colors text-sm font-body">
            &larr; Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

type FormData = {
  name: string;
  email: string;
  message: string;
};

type SubmissionState = {
  type: 'success' | 'error' | null;
  message: string;
};

export default function Contact() {
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    type: null,
    message: '',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setSubmissionState({ type: null, message: '' });
      
      const response = await fetch('https://formspree.io/f/meolvvda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: data.message,
        }),
      });

      if (response.ok) {
        setSubmissionState({
          type: 'success',
          message: 'Thank you! Your message has been sent successfully. I\'ll get back to you soon.',
        });
        reset(); // Reset the form after successful submission
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmissionState({
        type: 'error',
        message: 'Sorry, there was an error sending your message. Please try again or contact me directly.',
      });
    }
  };

  return (
    <div className="min-h-[85vh] text-gray-700 py-6 lg:px-8 xl:px-12">
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 xl:mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 lg:mb-8 dark:text-white transition-colors">
            Contact Form
          </h1>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-700 dark:text-gray-200 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto leading-relaxed px-4">
            Interested in collaborating or just want to say hello? Complete the
            form below, and I'll respond promptly—typically within one business
            day.
          </p>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
          {/* Success/Error Messages */}
          {submissionState.type && (
            <div className={`mb-6 p-4 rounded-lg border ${
              submissionState.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {submissionState.type === 'success' ? (
                    <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    {submissionState.message}
                  </p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setSubmissionState({ type: null, message: '' })}
                    className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white dark:bg-gray-900/50 p-4 space-y-4 sm:space-y-5 md:space-y-6"
          >
            {/* Name Field */}
            <div>
              <label className="block mb-2 text-sm sm:text-base lg:text-lg font-medium text-gray-700 dark:text-gray-200">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Please enter your name"
                {...register("name", { required: "Name is required" })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base lg:text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 focus:outline-none transition-all duration-200"
                autoComplete="name"
              />
              {errors.name && (
                <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1.5">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block mb-2 text-sm sm:text-base lg:text-lg font-medium text-gray-700 dark:text-gray-200">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="name@yourdomain.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Invalid email address",
                  },
                })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base lg:text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 focus:outline-none transition-all duration-200"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1.5">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Message Field */}
            <div>
              <label className="block mb-2 text-sm sm:text-base lg:text-lg font-medium text-gray-700 dark:text-gray-200">
                Your Message <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Enter your message here..."
                {...register("message", { required: "Message is required" })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base lg:text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 focus:outline-none transition-all duration-200 resize-y min-h-[100px] sm:min-h-[120px] md:min-h-[140px]"
                rows={4}
                autoComplete="off"
              />
              {errors.message && (
                <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1.5">
                  {errors.message.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2 sm:pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto min-w-[120px] sm:min-w-[140px] inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base lg:text-lg font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isSubmitting
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-blue-400 shadow-md hover:shadow-lg transform hover:scale-105"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden sm:inline">Sending Message...</span>
                    <span className="sm:hidden">Sending...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Send Message</span>
                    <span className="sm:hidden">Send</span>
                  </>
                )}
              </button>
            </div>

            {/* Form Info */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
                <span className="text-red-500">*</span> Required fields
              </p>
            </div>
          </form>
        </div>

        {/* Contact Info Section */}
        <div className="mt-8 sm:mt-12 lg:mt-16 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Other ways to reach me
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                📧 Email: hello@anjotadena.com
              </p>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                🌐 LinkedIn: /in/anjotadena
              </p>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                💻 GitHub: @anjotadena
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useForm } from "react-hook-form";

type FormData = {
  name: string;
  email: string;
  message: string;
};

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    console.log("Form Data:", data);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));
    reset(); // Reset the form after submission
    alert("Message sent successfully!");
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
                    <span className="hidden sm:inline">Sending...</span>
                    <span className="sm:hidden">Sending</span>
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

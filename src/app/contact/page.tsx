"use client"; // Mark the page as a client component for interactivity

import { useForm } from "react-hook-form";

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data: Partial<{ name: string; email: string, message: string }>) => {
    console.log("Form Data:", data);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));
    reset(); // Reset the form after submission
    alert("Message sent successfully!");
  };

  return (
    <div className="min-h-[85vh] text-gray-700 p-6">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Contact Form</h1>
        <p className="text-lg text-gray-700 mb-12 text-center">
          Interested in collaborating or just want to say hello? Complete the
          form below, and I’ll respond promptly—typically within one business
          day.
        </p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-2/4 p-6 rounded-lg space-y-4 mx-auto pt-12"
        >
          {/* Name Field */}
          <div>
            <label className="block mb-2 text-sm font-medium">Name</label>
            <input
              type="text"
              placeholder="Please enter your name"
              {...register("name", { required: "Name is required" })}
              className="w-full px-4 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
              autoComplete="off"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">
                {errors.name.message?.toString() ?? ""}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block mb-2 text-sm font-medium">Your email</label>
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
              className="w-full px-4 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
              autoComplete="off"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">
                {errors.email.message?.toString() ?? ""}
              </p>
            )}
          </div>

          {/* Message Field */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Your message
            </label>
            <textarea
              placeholder="Enter your message here..."
              {...register("message", { required: "Message is required" })}
              className="w-full px-4 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
              rows={4}
              autoComplete="off"
            />
            {errors.message && (
              <p className="text-red-400 text-sm mt-1">
                {errors.message.message?.toString() ?? ""}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center text-blue-700 border border-blue-600 py-2 px-6 gap-2 rounded inline-flex items-center text-blue-700 ${
                isSubmitting
                  ? "cursor-not-allowed"
                  : "hover:text-white hover:bg-blue-800"
              }`}
            >
              {isSubmitting ? "Sending..." : "Send message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

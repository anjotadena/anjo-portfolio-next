"use client"; // Mark the page as a client component for interactivity

import { useForm } from "react-hook-form";

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data: any) => {
    console.log("Form Data:", data);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));
    reset(); // Reset the form after submission
    alert("Message sent successfully!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
      <h1 className="text-4xl font-bold mb-4">Contact Form</h1>
      <p className="text-lg mb-8 text-gray-400 text-center">
        Want to discuss working together or just want to say hi? Fill out and submit the form below, and I'll get back to you as soon as I can (usually within 1 business day).
      </p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-md space-y-4"
      >
        {/* Name Field */}
        <div>
          <label className="block mb-2 text-sm font-medium">Name</label>
          <input
            type="text"
            placeholder="Please enter your name"
            {...register("name", { required: "Name is required" })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-600 focus:outline-none"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message?.toString() ?? ""}</p>
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
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-600 focus:outline-none"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message?.toString() ?? ""}</p>
          )}
        </div>

        {/* Message Field */}
        <div>
          <label className="block mb-2 text-sm font-medium">Your message</label>
          <textarea
            placeholder="Enter your message here..."
            {...register("message", { required: "Message is required" })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-600 focus:outline-none"
            rows={4}
          />
          {errors.message && (
            <p className="text-red-500 text-sm mt-1">{errors.message.message?.toString() ?? ""}</p>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 rounded-md font-medium ${
              isSubmitting
                ? "bg-purple-500 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {isSubmitting ? "Sending..." : "Send message"}
          </button>
        </div>
      </form>
    </div>
  );
}

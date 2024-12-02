"use client";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

export default function Button({ children, variant = "primary" }: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded text-white";
  const variantStyles =
    variant === "primary"
      ? "bg-blue-600 hover:bg-blue-700"
      : "bg-gray-600 hover:bg-gray-700";

  return (
    <button className={`${baseStyles} ${variantStyles}`}>{children}</button>
  );
}

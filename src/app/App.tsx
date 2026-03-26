import React from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/Toaster";
import { ThemeProvider } from "./components/ThemeProvider";

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
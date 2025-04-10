"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";
import { Scale, Ruler } from "lucide-react";

interface BMIForm {
  weight: number | ""; // in kg
  height: number | ""; // in cm
}

export default function BMICalculator() {
  const theme = useSelector(selectTheme);
  const [form, setForm] = useState<BMIForm>({ weight: "", height: "" });
  const [bmi, setBMI] = useState<number | null>(null);
  const [category, setCategory] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.weight || !form.height) {
      setError("Please enter both weight and height.");
      return;
    }

    const weight = Number(form.weight);
    const height = Number(form.height) / 100; // Convert cm to m
    if (weight <= 0 || height <= 0) {
      setError("Please enter valid positive numbers.");
      return;
    }

    const bmiValue = weight / (height * height);
    setBMI(Number(bmiValue.toFixed(1)));

    // BMI Categories
    if (bmiValue < 18.5) setCategory("Underweight");
    else if (bmiValue < 25) setCategory("Normal Weight");
    else if (bmiValue < 30) setCategory("Overweight");
    else setCategory("Obese");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, staggerChildren: 0.1 },
    },
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)" },
    tap: { scale: 0.95 },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`p-8 pb-12 mt-12 mb-12 rounded-2xl shadow-xl mx-auto max-w-3xl ${
        theme === "light"
          ? "bg-gradient-to-br from-white to-gray-100"
          : "bg-gradient-to-br from-gray-800 to-gray-900"
      }`}
    >
      <h2
        className={`text-4xl font-extrabold text-center mb-4 ${
          theme === "light" ? "text-gray-800" : "text-white"
        }`}
      >
        BMI{" "}
        <span className={theme === "light" ? "text-blue-600" : "text-blue-400"}>
          Calculator
        </span>
      </h2>
      <p
        className={`text-center mb-8 text-lg ${
          theme === "light" ? "text-gray-600" : "text-gray-300"
        }`}
      >
        Calculate your Body Mass Index to understand your weight status.
      </p>

      <form onSubmit={calculateBMI} className="space-y-6">
        <motion.div variants={inputVariants} className="relative">
          <label
            htmlFor="weight"
            className={`block mb-2 font-medium ${
              theme === "light" ? "text-gray-700" : "text-gray-200"
            }`}
          >
            Weight (kg)
          </label>
          <div className="relative">
            <Scale
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                theme === "light" ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <input
              type="number"
              id="weight"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border shadow-sm ${
                theme === "light"
                  ? "bg-white border-gray-200 text-gray-800"
                  : "bg-gray-700 border-gray-600 text-white"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., 70"
              min="1"
              step="0.1"
            />
          </div>
        </motion.div>

        <motion.div variants={inputVariants} className="relative">
          <label
            htmlFor="height"
            className={`block mb-2 font-medium ${
              theme === "light" ? "text-gray-700" : "text-gray-200"
            }`}
          >
            Height (cm)
          </label>
          <div className="relative">
            <Ruler
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                theme === "light" ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <input
              type="number"
              id="height"
              name="height"
              value={form.height}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border shadow-sm ${
                theme === "light"
                  ? "bg-white border-gray-200 text-gray-800"
                  : "bg-gray-700 border-gray-600 text-white"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., 170"
              min="1"
              step="0.1"
            />
          </div>
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-center text-sm font-medium"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          type="submit"
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          className={`w-full py-3 rounded-full font-semibold shadow-lg ${
            theme === "light"
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Calculate My BMI
        </motion.button>
      </form>

      {bmi !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          className={`mt-8 p-6 rounded-xl shadow-inner text-center ${
            theme === "light"
              ? "bg-gradient-to-r from-blue-100 to-blue-200"
              : "bg-gradient-to-r from-gray-700 to-gray-600"
          }`}
        >
          <h3
            className={`text-xl font-semibold mb-2 ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            Your BMI Result
          </h3>
          <p
            className={`text-4xl font-extrabold ${
              theme === "light" ? "text-blue-600" : "text-blue-400"
            }`}
          >
            {bmi}
          </p>
          <p
            className={`mt-2 text-lg font-medium ${
              theme === "light" ? "text-gray-700" : "text-gray-200"
            }`}
          >
            Category: {category}
          </p>
        </motion.div>
      )}
    </motion.section>
  );
}

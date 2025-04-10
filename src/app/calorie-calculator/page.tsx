"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";
import { User, Scale, Ruler, Activity } from "lucide-react";

interface CalorieForm {
  age: number | "";
  gender: "male" | "female" | "";
  weight: number | ""; // in kg
  height: number | ""; // in cm
  activityLevel:
    | "sedentary"
    | "light"
    | "moderate"
    | "active"
    | "very active"
    | "";
}

export default function CalorieCalculatorPage() {
  const theme = useSelector(selectTheme);
  const [form, setForm] = useState<CalorieForm>({
    age: "",
    gender: "",
    weight: "",
    height: "",
    activityLevel: "",
  });
  const [calories, setCalories] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const calculateCalories = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.age ||
      !form.gender ||
      !form.weight ||
      !form.height ||
      !form.activityLevel
    ) {
      setError("Please fill out all fields.");
      return;
    }

    const age = Number(form.age);
    const weight = Number(form.weight);
    const height = Number(form.height);

    if (age <= 0 || weight <= 0 || height <= 0) {
      setError(
        "Please enter valid positive numbers for age, weight, and height."
      );
      return;
    }

    let bmr: number =
      form.gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      "very active": 1.9,
    };

    const totalCalories =
      bmr *
      activityMultipliers[
        form.activityLevel as keyof typeof activityMultipliers
      ];
    setCalories(Math.round(totalCalories));
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
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${
        theme === "light" ? "bg-gray-100" : "bg-gray-900"
      }`}
    >
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`p-8 pb-12 rounded-2xl shadow-xl max-w-3xl w-full ${
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
          Calorie{" "}
          <span
            className={
              theme === "light" ? "text-yellow-600" : "text-yellow-400"
            }
          >
            Calculator
          </span>
        </h2>
        <p
          className={`text-center mb-8 text-lg ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          Find out how many calories you need daily to fuel your goals.
        </p>

        <form onSubmit={calculateCalories} className="space-y-6">
          <motion.div variants={inputVariants} className="relative">
            <label
              htmlFor="age"
              className={`block mb-2 font-medium ${
                theme === "light" ? "text-gray-700" : "text-gray-200"
              }`}
            >
              Age (years)
            </label>
            <div className="relative">
              <User
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  theme === "light" ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="number"
                id="age"
                name="age"
                value={form.age}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border shadow-sm ${
                  theme === "light"
                    ? "bg-white border-gray-200 text-gray-800"
                    : "bg-gray-700 border-gray-600 text-white"
                } focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all`}
                placeholder="e.g., 30"
                min="1"
              />
            </div>
          </motion.div>

          <motion.div variants={inputVariants}>
            <label
              htmlFor="gender"
              className={`block mb-2 font-medium ${
                theme === "light" ? "text-gray-700" : "text-gray-200"
              }`}
            >
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border shadow-sm ${
                theme === "light"
                  ? "bg-white border-gray-200 text-gray-800"
                  : "bg-gray-700 border-gray-600 text-white"
              } focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all`}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </motion.div>

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
                } focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all`}
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
                } focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all`}
                placeholder="e.g., 170"
                min="1"
                step="0.1"
              />
            </div>
          </motion.div>

          <motion.div variants={inputVariants}>
            <label
              htmlFor="activityLevel"
              className={`block mb-2 font-medium ${
                theme === "light" ? "text-gray-700" : "text-gray-200"
              }`}
            >
              Activity Level
            </label>
            <div className="relative">
              <Activity
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  theme === "light" ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <select
                id="activityLevel"
                name="activityLevel"
                value={form.activityLevel}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border shadow-sm ${
                  theme === "light"
                    ? "bg-white border-gray-200 text-gray-800"
                    : "bg-gray-700 border-gray-600 text-white"
                } focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all`}
              >
                <option value="">Select Activity Level</option>
                <option value="sedentary">
                  Sedentary (little or no exercise)
                </option>
                <option value="light">Light (exercise 1-3 days/week)</option>
                <option value="moderate">
                  Moderate (exercise 3-5 days/week)
                </option>
                <option value="active">Active (exercise 6-7 days/week)</option>
                <option value="very active">
                  Very Active (physical job, intense exercise)
                </option>
              </select>
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
            className={`w-full py-3 rounded-full font-semibold shadow-lg transition-colors ${
              theme === "light"
                ? "bg-yellow-500 text-black hover:bg-yellow-600"
                : "bg-yellow-600 text-white hover:bg-yellow-700"
            }`}
          >
            Calculate My Calories
          </motion.button>
        </form>

        {calories !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className={`mt-8 p-6 rounded-xl shadow-inner text-center ${
              theme === "light"
                ? "bg-gradient-to-r from-yellow-100 to-yellow-200"
                : "bg-gradient-to-r from-gray-700 to-gray-600"
            }`}
          >
            <h3
              className={`text-xl font-semibold mb-2 ${
                theme === "light" ? "text-gray-800" : "text-white"
              }`}
            >
              Your Daily Calorie Needs
            </h3>
            <p
              className={`text-4xl font-extrabold ${
                theme === "light" ? "text-yellow-600" : "text-yellow-400"
              }`}
            >
              {calories} <span className="text-xl">kcal</span>
            </p>
            <p
              className={`mt-2 text-sm ${
                theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
            >
              Estimated to maintain your current weight based on your activity
              level.
            </p>
          </motion.div>
        )}
      </motion.section>
    </div>
  );
}

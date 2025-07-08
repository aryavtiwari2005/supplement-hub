"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";
import { Scale, Activity, Target } from "lucide-react";

interface ProteinForm {
  weight: number | ""; // in kg
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very active" | "";
  goal: "maintenance" | "muscle_gain" | "fat_loss" | "";
}

export default function ProteinCalculator() {
  const theme = useSelector(selectTheme);
  const [proteinForm, setProteinForm] = useState<ProteinForm>({
    weight: "",
    activityLevel: "",
    goal: "",
  });
  const [protein, setProtein] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handler for form changes
  const handleProteinChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProteinForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  // Calculate protein needs
  const calculateProtein = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proteinForm.weight || !proteinForm.activityLevel || !proteinForm.goal) {
      setError("Please fill out all fields.");
      return;
    }

    const weight = Number(proteinForm.weight);
    if (weight <= 0) {
      setError("Please enter a valid positive weight.");
      return;
    }

    // Base protein ranges (grams per kg body weight)
    const proteinRanges = {
      sedentary: { min: 0.8, max: 1.0 },
      light: { min: 1.0, max: 1.2 },
      moderate: { min: 1.2, max: 1.6 },
      active: { min: 1.6, max: 2.0 },
      "very active": { min: 2.0, max: 2.2 },
    };

    // Goal adjustments
    const goalMultipliers = {
      maintenance: 1.0,
      muscle_gain: 1.2,
      fat_loss: 1.1,
    };

    const { min, max } = proteinRanges[proteinForm.activityLevel as keyof typeof proteinRanges];
    const multiplier = goalMultipliers[proteinForm.goal as keyof typeof goalMultipliers];
    const averageProtein = ((min + max) / 2) * weight * multiplier;
    setProtein(Math.round(averageProtein));
  };

  // Animation Variants
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
      className={`p-4 sm:p-8 pb-8 sm:pb-12 mb-8 sm:mb-12 rounded-xl sm:rounded-2xl shadow-xl mx-auto w-full max-w-md sm:max-w-3xl ${theme === "light"
          ? "bg-gradient-to-br from-white to-gray-100"
          : "bg-gradient-to-br from-gray-800 to-gray-900"
        }`}
    >
      <h2
        className={`text-2xl sm:text-4xl font-extrabold text-center mb-3 sm:mb-4 ${theme === "light" ? "text-gray-800" : "text-white"
          }`}
      >
        Protein{" "}
        <span className={theme === "light" ? "text-green-600" : "text-green-400"}>
          Calculator
        </span>
      </h2>
      <p
        className={`text-center mb-6 sm:mb-8 text-sm sm:text-lg ${theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
      >
        Calculate your daily protein needs based on your activity level and fitness goals.
      </p>

      <form onSubmit={calculateProtein} className="space-y-4 sm:space-y-6">
        <motion.div variants={inputVariants} className="relative">
          <label
            htmlFor="weight"
            className={`block mb-1 sm:mb-2 font-medium text-sm sm:text-base ${theme === "light" ? "text-gray-700" : "text-gray-200"
              }`}
          >
            Weight (kg)
          </label>
          <div className="relative">
            <Scale
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 ${theme === "light" ? "text-gray-400" : "text-gray-500"
                }`}
            />
            <input
              type="number"
              id="weight"
              name="weight"
              value={proteinForm.weight}
              onChange={handleProteinChange}
              className={`w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg border shadow-sm text-sm sm:text-base ${theme === "light"
                  ? "bg-white border-gray-200 text-gray-800"
                  : "bg-gray-700 border-gray-600 text-white"
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
              placeholder="e.g., 70"
              min="1"
              step="0.1"
            />
          </div>
        </motion.div>

        <motion.div variants={inputVariants}>
          <label
            htmlFor="activityLevel"
            className={`block mb-1 sm:mb-2 font-medium text-sm sm:text-base ${theme === "light" ? "text-gray-700" : "text-gray-200"
              }`}
          >
            Activity Level
          </label>
          <div className="relative">
            <Activity
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 ${theme === "light" ? "text-gray-400" : "text-gray-500"
                }`}
            />
            <select
              id="activityLevel"
              name="activityLevel"
              value={proteinForm.activityLevel}
              onChange={handleProteinChange}
              className={`w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg border shadow-sm text-sm sm:text-base ${theme === "light"
                  ? "bg-white border-gray-200 text-gray-800"
                  : "bg-gray-700 border-gray-600 text-white"
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
            >
              <option value="">Select Activity Level</option>
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="light">Light (exercise 1-3 days/week)</option>
              <option value="moderate">Moderate (exercise 3-5 days/week)</option>
              <option value="active">Active (exercise 6-7 days/week)</option>
              <option value="very active">Very Active (physical job, intense exercise)</option>
            </select>
          </div>
        </motion.div>

        <motion.div variants={inputVariants}>
          <label
            htmlFor="goal"
            className={`block mb-1 sm:mb-2 font-medium text-sm sm:text-base ${theme === "light" ? "text-gray-700" : "text-gray-200"
              }`}
          >
            Fitness Goal
          </label>
          <div className="relative">
            <Target
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 ${theme === "light" ? "text-gray-400" : "text-gray-500"
                }`}
            />
            <select
              id="goal"
              name="goal"
              value={proteinForm.goal}
              onChange={handleProteinChange}
              className={`w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg border shadow-sm text-sm sm:text-base ${theme === "light"
                  ? "bg-white border-gray-200 text-gray-800"
                  : "bg-gray-700 border-gray-600 text-white"
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
            >
              <option value="">Select Goal</option>
              <option value="maintenance">Maintenance</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="fat_loss">Fat Loss</option>
            </select>
          </div>
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-center text-xs sm:text-sm font-medium"
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
          className={`w-full py-2 sm:py-3 rounded-full font-semibold shadow-lg text-sm sm:text-base ${theme === "light"
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-green-600 text-white hover:bg-green-700"
            }`}
        >
          Calculate My Protein
        </motion.button>
      </form>

      {protein !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          className={`mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl shadow-inner text-center ${theme === "light"
              ? "bg-gradient-to-r from-green-100 to-green-200"
              : "bg-gradient-to-r from-gray-700 to-gray-600"
            }`}
        >
          <h3
            className={`text-lg sm:text-xl font-semibold mb-1 sm:mb-2 ${theme === "light" ? "text-gray-800" : "text-white"
              }`}
          >
            Your Daily Protein Needs
          </h3>
          <p
            className={`text-2xl sm:text-4xl font-extrabold ${theme === "light" ? "text-green-600" : "text-green-400"
              }`}
          >
            {protein} <span className="text-base sm:text-xl">grams</span>
          </p>
          <p
            className={`mt-1 sm:mt-2 text-xs sm:text-sm ${theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
          >
            Recommended protein intake based on your weight, activity level, and fitness goal.
          </p>
        </motion.div>
      )}
    </motion.section>
  );
}
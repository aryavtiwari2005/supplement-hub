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

interface BMIForm {
  weight: number | ""; // in kg
  height: number | ""; // in cm
}

export default function CalorieCalculator() {
  const theme = useSelector(selectTheme);
  const [activeCalculator, setActiveCalculator] = useState<"calorie" | "bmi">(
    "calorie"
  );

  // Calorie Calculator State
  const [calorieForm, setCalorieForm] = useState<CalorieForm>({
    age: "",
    gender: "",
    weight: "",
    height: "",
    activityLevel: "",
  });
  const [calories, setCalories] = useState<number | null>(null);

  // BMI Calculator State
  const [bmiForm, setBMIForm] = useState<BMIForm>({ weight: "", height: "" });
  const [bmi, setBMI] = useState<number | null>(null);
  const [category, setCategory] = useState<string>("");

  const [error, setError] = useState<string | null>(null);

  // Handlers
  const handleCalorieChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCalorieForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleBMIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBMIForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const calculateCalories = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !calorieForm.age ||
      !calorieForm.gender ||
      !calorieForm.weight ||
      !calorieForm.height ||
      !calorieForm.activityLevel
    ) {
      setError("Please fill out all fields.");
      return;
    }

    const age = Number(calorieForm.age);
    const weight = Number(calorieForm.weight);
    const height = Number(calorieForm.height);

    if (age <= 0 || weight <= 0 || height <= 0) {
      setError("Please enter valid positive numbers.");
      return;
    }

    let bmr: number =
      calorieForm.gender === "male"
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
        calorieForm.activityLevel as keyof typeof activityMultipliers
      ];
    setCalories(Math.round(totalCalories));
  };

  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bmiForm.weight || !bmiForm.height) {
      setError("Please enter both weight and height.");
      return;
    }

    const weight = Number(bmiForm.weight);
    const height = Number(bmiForm.height) / 100;
    if (weight <= 0 || height <= 0) {
      setError("Please enter valid positive numbers.");
      return;
    }

    const bmiValue = weight / (height * height);
    setBMI(Number(bmiValue.toFixed(1)));

    if (bmiValue < 18.5) setCategory("Underweight");
    else if (bmiValue < 25) setCategory("Normal Weight");
    else if (bmiValue < 30) setCategory("Overweight");
    else setCategory("Obese");
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

  const tabVariants = {
    inactive: { scale: 1, y: 0 },
    active: {
      scale: 1.05,
      y: -5,
      transition: { type: "spring", stiffness: 300 },
    },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`p-8 pb-12 mb-12 rounded-2xl shadow-xl mx-auto max-w-3xl ${
        theme === "light"
          ? "bg-gradient-to-br from-white to-gray-100"
          : "bg-gradient-to-br from-gray-800 to-gray-900"
      }`}
    >
      {/* Toggle */}
      <div className="flex justify-center gap-6 mb-8">
        <motion.div
          variants={tabVariants}
          animate={activeCalculator === "calorie" ? "active" : "inactive"}
          onClick={() => setActiveCalculator("calorie")}
          className={`flex items-center gap-2 px-6 py-3 rounded-full cursor-pointer ${
            theme === "light"
              ? "bg-white text-gray-800"
              : "bg-gray-800 text-white"
          } ${
            activeCalculator === "calorie" ? "shadow-lg" : "hover:bg-opacity-80"
          }`}
        >
          <Scale className="h-5 w-5" />
          <span className="font-semibold">Calorie Calculator</span>
        </motion.div>
        <motion.div
          variants={tabVariants}
          animate={activeCalculator === "bmi" ? "active" : "inactive"}
          onClick={() => setActiveCalculator("bmi")}
          className={`flex items-center gap-2 px-6 py-3 rounded-full cursor-pointer ${
            theme === "light"
              ? "bg-white text-gray-800"
              : "bg-gray-800 text-white"
          } ${
            activeCalculator === "bmi" ? "shadow-lg" : "hover:bg-opacity-80"
          }`}
        >
          <Ruler className="h-5 w-5" />
          <span className="font-semibold">BMI Calculator</span>
        </motion.div>
      </div>

      {/* Calculator Content */}
      {activeCalculator === "calorie" ? (
        <>
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
                  value={calorieForm.age}
                  onChange={handleCalorieChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border shadow-sm ${
                    theme === "light"
                      ? "bg-white border-gray-200 text-gray-800"
                      : "bg-gray-700 border-gray-600 text-white"
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
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
                value={calorieForm.gender}
                onChange={handleCalorieChange}
                className={`w-full p-3 rounded-lg border shadow-sm ${
                  theme === "light"
                    ? "bg-white border-gray-200 text-gray-800"
                    : "bg-gray-700 border-gray-600 text-white"
                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
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
                  value={calorieForm.weight}
                  onChange={handleCalorieChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border shadow-sm ${
                    theme === "light"
                      ? "bg-white border-gray-200 text-gray-800"
                      : "bg-gray-700 border-gray-600 text-white"
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
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
                  value={calorieForm.height}
                  onChange={handleCalorieChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border shadow-sm ${
                    theme === "light"
                      ? "bg-white border-gray-200 text-gray-800"
                      : "bg-gray-700 border-gray-600 text-white"
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
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
                  value={calorieForm.activityLevel}
                  onChange={handleCalorieChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border shadow-sm ${
                    theme === "light"
                      ? "bg-white border-gray-200 text-gray-800"
                      : "bg-gray-700 border-gray-600 text-white"
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                >
                  <option value="">Select Activity Level</option>
                  <option value="sedentary">
                    Sedentary (little or no exercise)
                  </option>
                  <option value="light">Light (exercise 1-3 days/week)</option>
                  <option value="moderate">
                    Moderate (exercise 3-5 days/week)
                  </option>
                  <option value="active">
                    Active (exercise 6-7 days/week)
                  </option>
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
              className={`w-full py-3 rounded-full font-semibold shadow-lg ${
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
        </>
      ) : (
        <>
          <h2
            className={`text-4xl font-extrabold text-center mb-4 ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            BMI{" "}
            <span
              className={theme === "light" ? "text-blue-600" : "text-blue-400"}
            >
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
                  value={bmiForm.weight}
                  onChange={handleBMIChange}
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
                  value={bmiForm.height}
                  onChange={handleBMIChange}
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
        </>
      )}
    </motion.section>
  );
}

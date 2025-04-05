"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

export default function FitnessConsultancyPage() {
  const theme = useSelector(selectTheme);
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    fitnessGoals: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("fitness_consultations").insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          fitness_goals: formData.fitnessGoals,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setSubmitSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        fitnessGoals: "",
      });

      setTimeout(() => {
        setShowForm(false);
        setSubmitSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error saving consultation:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 50 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const titleVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, delay: 0.2 },
    },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className={`min-h-screen font-sans ${
        theme === "light"
          ? "bg-gradient-to-b from-gray-50 to-gray-100"
          : "bg-gradient-to-b from-gray-900 to-gray-800"
      }`}
    >
      <div className="container mx-auto px-6 py-20">
        {/* Page Title */}
        <motion.div variants={titleVariants} className="text-center mb-12">
          <h1
            className={`text-6xl md:text-7xl font-extrabold tracking-tight mb-4 ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            Free Fitness{" "}
            <span
              className={
                theme === "light"
                  ? "text-yellow-600 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-3 after:bg-yellow-200 after:opacity-30 after:-z-10"
                  : "text-yellow-400 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-3 after:bg-yellow-900 after:opacity-40 after:-z-10"
              }
            >
              Consultation
            </span>
          </h1>
          <p
            className={`text-xl mt-6 max-w-3xl mx-auto ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            Get expert advice tailored to your fitness journey completely free
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.3 } }}
          className={`max-w-4xl mx-auto mb-16 p-8 rounded-2xl ${
            theme === "light"
              ? "bg-white shadow-xl ring-1 ring-gray-100"
              : "bg-gray-800 shadow-xl ring-1 ring-gray-700"
          }`}
        >
          <h2
            className={`text-3xl font-bold mb-6 ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            Why Fitness Matters
          </h2>

          <div className="space-y-5 text-lg">
            <p
              className={theme === "light" ? "text-gray-600" : "text-gray-300"}
            >
              Regular physical activity is one of the most important things you
              can do for your health. Being active can help you maintain a
              healthy weight, reduce your risk of chronic diseases, and improve
              your overall quality of life.
            </p>

            <p
              className={`font-medium ${
                theme === "light" ? "text-gray-700" : "text-gray-200"
              }`}
            >
              Our certified fitness experts will provide personalized advice to
              help you:
            </p>

            <ul
              className={`grid grid-cols-1 md:grid-cols-2 gap-3 pl-5 ${
                theme === "light" ? "text-gray-700" : "text-gray-200"
              }`}
            >
              <li className="flex items-center space-x-2">
                <span
                  className={`text-xl ${
                    theme === "light" ? "text-yellow-500" : "text-yellow-500"
                  }`}
                >
                  ✓
                </span>
                <span>Create a customized workout plan</span>
              </li>
              <li className="flex items-center space-x-2">
                <span
                  className={`text-xl ${
                    theme === "light" ? "text-yellow-500" : "text-yellow-500"
                  }`}
                >
                  ✓
                </span>
                <span>Set realistic fitness goals</span>
              </li>
              <li className="flex items-center space-x-2">
                <span
                  className={`text-xl ${
                    theme === "light" ? "text-yellow-500" : "text-yellow-500"
                  }`}
                >
                  ✓
                </span>
                <span>Improve your nutrition</span>
              </li>
              <li className="flex items-center space-x-2">
                <span
                  className={`text-xl ${
                    theme === "light" ? "text-yellow-500" : "text-yellow-500"
                  }`}
                >
                  ✓
                </span>
                <span>Stay motivated and accountable</span>
              </li>
              <li className="flex items-center space-x-2">
                <span
                  className={`text-xl ${
                    theme === "light" ? "text-yellow-500" : "text-yellow-500"
                  }`}
                >
                  ✓
                </span>
                <span>Prevent injuries</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Call to Action */}
        <div className="text-center mt-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className={`px-10 py-4 rounded-full text-xl font-bold ${
              theme === "light"
                ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600"
                : "bg-gradient-to-r from-yellow-600 to-yellow-700 text-white hover:from-yellow-700 hover:to-yellow-800"
            } transition-all duration-300 shadow-lg`}
          >
            Book Free Consultation
          </motion.button>

          <p
            className={`mt-6 text-lg ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            Or call us directly at:{" "}
            <span className="font-bold text-xl">8860112296</span>
          </p>
        </div>

        {/* Consultation Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`relative rounded-2xl p-8 md:p-10 w-full max-w-md md:max-w-2xl ${
                theme === "light"
                  ? "bg-white shadow-2xl"
                  : "bg-gray-800 shadow-2xl"
              }`}
            >
              <button
                onClick={() => setShowForm(false)}
                className={`absolute top-6 right-6 text-2xl hover:rotate-90 transition-transform ${
                  theme === "light" ? "text-gray-500" : "text-gray-300"
                }`}
              >
                ✕
              </button>

              <h2
                className={`text-3xl md:text-4xl font-bold mb-6 md:mb-8 ${
                  theme === "light" ? "text-gray-800" : "text-white"
                }`}
              >
                Book Your Free Consultation
              </h2>

              {submitSuccess ? (
                <div
                  className={`p-6 md:p-8 rounded-xl mb-4 text-lg md:text-xl ${
                    theme === "light"
                      ? "bg-green-100 text-green-800"
                      : "bg-green-900 text-green-200"
                  }`}
                >
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-4xl md:text-5xl">✓</span>
                  </div>
                  <p className="text-center">
                    Thank you for your request! Our team will reach out to you
                    within 1-2 business days.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 md:space-y-8"
                >
                  <div className="md:grid md:grid-cols-2 md:gap-6">
                    <div className="mb-6 md:mb-0">
                      <label
                        className={`block mb-2 text-lg font-medium ${
                          theme === "light" ? "text-gray-700" : "text-gray-300"
                        }`}
                      >
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className={`w-full p-3 md:p-4 text-lg border rounded-lg ${
                          theme === "light"
                            ? "border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            : "border-gray-600 bg-gray-700 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        }`}
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label
                        className={`block mb-2 text-lg font-medium ${
                          theme === "light" ? "text-gray-700" : "text-gray-300"
                        }`}
                      >
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className={`w-full p-3 md:p-4 text-lg border rounded-lg ${
                          theme === "light"
                            ? "border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            : "border-gray-600 bg-gray-700 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        }`}
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block mb-2 text-lg font-medium ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`w-full p-3 md:p-4 text-lg border rounded-lg ${
                        theme === "light"
                          ? "border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          : "border-gray-600 bg-gray-700 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      }`}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label
                      className={`block mb-2 text-lg font-medium ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      Your Fitness Goals *
                    </label>
                    <textarea
                      name="fitnessGoals"
                      value={formData.fitnessGoals}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className={`w-full p-3 md:p-4 text-lg border rounded-lg ${
                        theme === "light"
                          ? "border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          : "border-gray-600 bg-gray-700 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      }`}
                      placeholder="Tell us about your fitness goals and any specific areas you need help with..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 px-6 rounded-lg text-xl font-bold ${
                      theme === "light"
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600"
                        : "bg-gradient-to-r from-yellow-600 to-yellow-700 text-white hover:from-yellow-700 hover:to-yellow-800"
                    } transition-colors duration-300 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </button>
                </form>
              )}

              <p
                className={`mt-6 text-sm md:text-base ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Our team will respond within 1-2 business days. For immediate
                assistance, call <span className="font-bold">8860112296</span>.
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

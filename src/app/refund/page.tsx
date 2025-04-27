"use client";

import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";

export default function RefundAndReturnPolicyPage() {
  const theme = useSelector(selectTheme);

  const pageVariants = {
    initial: { opacity: 0, y: 50 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -50, transition: { duration: 0.5 } },
  };

  const titleVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, delay: 0.2 },
    },
  };

  const dividerVariants = {
    initial: { width: 0 },
    animate: { width: "100%", transition: { duration: 1, delay: 0.4 } },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`min-h-screen ${
        theme === "light" ? "bg-gray-50" : "bg-gray-900"
      }`}
    >
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12">
        <motion.h1
          variants={titleVariants}
          className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-4 sm:mb-6 ${
            theme === "light" ? "text-gray-800" : "text-white"
          }`}
        >
          Refund{" "}
          <span
            className={`${
              theme === "light" ? "text-yellow-600" : "text-yellow-400"
            }`}
          >
            & Return Policy
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.3 } }}
          className={`text-center text-sm sm:text-base md:text-lg mb-8 sm:mb-12 max-w-3xl mx-auto ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          Last updated: April 27, 2025
        </motion.p>

        <motion.div
          variants={dividerVariants}
          className={`h-1 mx-auto mb-8 sm:mb-12 ${
            theme === "light" ? "bg-yellow-500" : "bg-yellow-400"
          } rounded-full max-w-xs sm:max-w-md`}
        />

        <section className="max-w-4xl mx-auto">
          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            Our Commitment
          </h2>
          <p
            className={`text-sm sm:text-base mb-6 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            At 1Scoop Protein, customer satisfaction is our priority. If you're
            not completely happy with your purchase, we offer a simple process
            for returns and refunds, subject to the terms below.
          </p>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            Returns
          </h2>
          <ul
            className={`list-disc pl-5 mb-6 text-sm sm:text-base ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            <li>
              <strong>Eligibility:</strong> Items can be returned within 10 days
              of purchase.
            </li>
            <li>
              <strong>Condition:</strong> Product must be unopened, unused, and
              in its original packaging.
            </li>
            <li>
              <strong>Process:</strong> Contact us at{" "}
              <a
                href="mailto:supplementhub.contact@gmail.com"
                className={`${
                  theme === "light" ? "text-yellow-600" : "text-yellow-400"
                } hover:underline`}
              >
                supplementhub.contact@gmail.com
              </a>{" "}
              with your order details and reason for return.
            </li>
          </ul>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            Refunds
          </h2>
          <p
            className={`text-sm sm:text-base mb-4 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            Once the return is received and inspected, we will notify you of the
            approval or rejection of your refund.
          </p>
          <ul
            className={`list-disc pl-5 mb-6 text-sm sm:text-base ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            <li>Refunds will be issued to your original payment method.</li>
            <li>
              Shipping fees are non-refundable unless the product was defective
              or damaged upon arrival.
            </li>
          </ul>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            Exchanges
          </h2>
          <p
            className={`text-sm sm:text-base mb-6 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            If you received a defective or incorrect item, we will offer an
            exchange for the same product or a full refund.
          </p>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            Non-returnable Items
          </h2>
          <ul
            className={`list-disc pl-5 mb-6 text-sm sm:text-base ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            <li>Opened or used products</li>
            <li>Gift cards and clearance sale items</li>
          </ul>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            Contact Us
          </h2>
          <p
            className={`text-sm sm:text-base mb-6 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            For return and refund inquiries, please contact:
          </p>
          <p
            className={`text-sm sm:text-base mb-6 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            📧 Email:{" "}
            <a
              href="mailto:supplementhub.contact@gmail.com"
              className={`${
                theme === "light" ? "text-yellow-600" : "text-yellow-400"
              } hover:underline`}
            >
              supplementhub.contact@gmail.com
            </a>
          </p>
        </section>
      </div>
    </motion.div>
  );
}

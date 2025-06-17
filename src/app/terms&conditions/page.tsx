"use client";

import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";

export default function TermsAndConditionsPage() {
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
      className={`min-h-screen ${theme === "light" ? "bg-gray-50" : "bg-gray-900"
        }`}
    >
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12">
        <motion.h1
          variants={titleVariants}
          className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-4 sm:mb-6 ${theme === "light" ? "text-gray-800" : "text-white"
            }`}
        >
          Terms{" "}
          <span
            className={`${theme === "light" ? "text-yellow-600" : "text-yellow-400"
              }`}
          >
            & Conditions
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.3 } }}
          className={`text-center text-sm sm:text-base md:text-lg mb-8 sm:mb-12 max-w-3xl mx-auto ${theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
        >
          Last updated: April 27, 2025
        </motion.p>

        <motion.div
          variants={dividerVariants}
          className={`h-1 mx-auto mb-8 sm:mb-12 ${theme === "light" ? "bg-yellow-500" : "bg-yellow-400"
            } rounded-full max-w-xs sm:max-w-md`}
        />

        <section className="max-w-4xl mx-auto">
          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 ${theme === "light" ? "text-gray-800" : "text-white"
              }`}
          >
            Welcome to 1Scoop Protein!
          </h2>
          <p
            className={`text-sm sm:text-base mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
          >
            By accessing or using our website,{" "}
            <a
              href="https://www.1scoopprotein.com"
              className={`${theme === "light" ? "text-yellow-600" : "text-yellow-400"
                } hover:underline`}
            >
              www.1scoopprotein.com
            </a>{" "}
            ("Site"), you agree to comply with and be bound by the following
            Terms and Conditions. Please read them carefully.
          </p>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${theme === "light" ? "text-gray-800" : "text-white"
              }`}
          >
            1. Use of the Website
          </h2>
          <p
            className={`text-sm sm:text-base mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
          >
            You agree to use this Site for lawful purposes only. You must not
            misuse the Site by introducing viruses, trojans, or other harmful
            material.
          </p>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${theme === "light" ? "text-gray-800" : "text-white"
              }`}
          >
            2. Intellectual Property
          </h2>
          <p
            className={`text-sm sm:text-base mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
          >
            All content on this Site — including logos, product descriptions,
            images, graphics, and designs — is the property of 1Scoop Protein
            and is protected under copyright laws. Unauthorized use or
            reproduction is prohibited.
          </p>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${theme === "light" ? "text-gray-800" : "text-white"
              }`}
          >
            3. Product Information
          </h2>
          <p
            className={`text-sm sm:text-base mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
          >
            We strive to display accurate information, but we do not guarantee
            that product descriptions, prices, or other content is error-free.
            We reserve the right to correct any errors or omissions.
          </p>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${theme === "light" ? "text-gray-800" : "text-white"
              }`}
          >
            4. Orders and Payments
          </h2>
          <p
            className={`text-sm sm:text-base mb-4 ${theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
          >
            All orders placed are subject to acceptance and availability. We
            reserve the right to cancel any order at our discretion, including
            orders that appear to be fraudulent or violate our policies.
          </p>
          <p
            className={`text-sm sm:text-base mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
          >
            Payments must be made through the payment methods available on the
            Site. By providing payment information, you represent and warrant
            that you are authorized to use the payment method.
          </p>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${theme === "light" ? "text-gray-800" : "text-white"
              }`}
          >
            5. Shipping and Delivery
          </h2>
          <p
            className={`text-sm sm:text-base mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
          >
            Shipping times are estimated and not guaranteed. We are not
            responsible for delays due to unforeseen circumstances such as
            customs processing or courier delays.
          </p>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${theme === "light" ? "text-gray-800" : "text-white"
              }`}
          >
            6. Returns and Refunds
          </h2>
          <p
            className={`text-sm sm:text-base mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
          >
            Please refer to our{" "}
            <a
              href="/refund"
              className={`${theme === "light" ? "text-yellow-600" : "text-yellow-400"
                } hover:underline`}
            >
              Refund Policy
            </a>{" "}
            for details on returns, exchanges, and refunds.
          </p>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${theme === "light" ? "text-gray-800" : "text-white"
              }`}
          >
            7. Limitation of Liability
          </h2>
          <p
            className={`text-sm sm:text-base mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
          >
            To the fullest extent permitted by law, 1Scoop Protein shall not be
            liable for any indirect, incidental, or consequential damages
            arising out of or in connection with the use of our Site or
            products.
          </p>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${theme === "light" ? "text-gray-800" : "text-white"
              }`}
          >
            8. Indemnification
          </h2>
          <p
            className={`text-sm sm:text-base mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
          >
            You agree to indemnify and hold harmless 1Scoop Protein from any
            claims, damages, expenses, or liabilities arising from your use of
            the Site or violation of these Terms.
          </p>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${theme === "light" ? "text-gray-800" : "text-white"
              }`}
          >
            9. Third-Party Links
          </h2>
          <p
            className={`text-sm sm:text-base mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
          >
            Our Site may contain links to third-party websites. We do not
            endorse and are not responsible for the content, policies, or
            practices of third parties.
          </p>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${theme === "light" ? "text-gray-800" : "text-white"
              }`}
          >
            10. Changes to Terms and Conditions
          </h2>
          <p
            className={`text-sm sm:text-base mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
          >
            We may update these Terms and Conditions at any time. Changes will
            be effective immediately upon posting. Your continued use of the
            Site constitutes your acceptance of any revised Terms.
          </p>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${theme === "light" ? "text-gray-800" : "text-white"
              }`}
          >
            11. Governing Law
          </h2>
          <p
            className={`text-sm sm:text-base mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
          >
            These Terms shall be governed by and construed in accordance with
            the laws of India. Any disputes arising under these Terms will be
            subject to the exclusive jurisdiction of the courts located in
            Delhi, India.
          </p>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${theme === "light" ? "text-gray-800" : "text-white"
              }`}
          >
            12. Contact Information
          </h2>
          <p
            className={`text-sm sm:text-base mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
          >
            For questions regarding these Terms and Conditions, please contact:
          </p>
          <p
            className={`text-sm sm:text-base mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
          >
            📧 Email:{" "}
            <a
              href="mailto:supplementhub.contact@gmail.com"
              className={`${theme === "light" ? "text-yellow-600" : "text-yellow-400"
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

"use client";

import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";

export default function PrivacyPolicyPage() {
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
          Privacy{" "}
          <span
            className={`${
              theme === "light" ? "text-yellow-600" : "text-yellow-400"
            }`}
          >
            Policy
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
            Welcome to 1Scoop Protein!
          </h2>
          <p
            className={`text-sm sm:text-base mb-6 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            We value your trust and are committed to protecting your privacy.
            This Privacy Policy describes how we collect, use, and protect your
            personal information when you visit or purchase from{" "}
            <a
              href="https://www.1scoopprotein.com"
              className={`${
                theme === "light" ? "text-yellow-600" : "text-yellow-400"
              } hover:underline`}
            >
              www.1scoopprotein.com
            </a>{" "}
            ("Site").
          </p>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            Information We Collect
          </h2>
          <ul
            className={`list-disc pl-5 mb-6 text-sm sm:text-base ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            <li>
              <strong>Personal Information:</strong> Name, email address,
              shipping address, phone number, payment details.
            </li>
            <li>
              <strong>Non-Personal Information:</strong> Browser type, device
              information, IP address, pages visited, and interaction patterns
              on the Site.
            </li>
            <li>
              <strong>Cookies and Tracking:</strong> We use cookies, pixels, and
              similar technologies for analytics, marketing, and site
              performance.
            </li>
          </ul>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            How We Use Your Information
          </h2>
          <p
            className={`text-sm sm:text-base mb-4 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            We use your information to:
          </p>
          <ul
            className={`list-disc pl-5 mb-6 text-sm sm:text-base ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            <li>Process and fulfill your orders</li>
            <li>Improve your shopping experience</li>
            <li>Communicate with you (order updates, promotional emails)</li>
            <li>Conduct analytics and improve our website</li>
            <li>Prevent fraudulent transactions</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            Sharing of Information
          </h2>
          <p
            className={`text-sm sm:text-base mb-4 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            We may share your information with:
          </p>
          <ul
            className={`list-disc pl-5 mb-6 text-sm sm:text-base ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            <li>
              Trusted third parties like logistics partners, payment processors,
              and marketing platforms.
            </li>
            <li>Law enforcement authorities when legally required.</li>
          </ul>
          <p
            className={`text-sm sm:text-base mb-6 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            We do not sell, rent, or trade your personal information to third
            parties for their marketing purposes.
          </p>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            Your Choices
          </h2>
          <ul
            className={`list-disc pl-5 mb-6 text-sm sm:text-base ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            <li>
              <strong>Opt-Out:</strong> You can opt-out of marketing emails
              anytime by clicking "unsubscribe" at the bottom of any email.
            </li>
            <li>
              <strong>Cookie Preferences:</strong> Adjust your browser settings
              to manage cookies.
            </li>
            <li>
              <strong>Account Deletion:</strong> Contact us at{" "}
              <a
                href="mailto:support@1scoopprotein.com"
                className={`${
                  theme === "light" ? "text-yellow-600" : "text-yellow-400"
                } hover:underline`}
              >
                support@1scoopprotein.com
              </a>{" "}
              to delete your account or personal information.
            </li>
          </ul>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            Data Security
          </h2>
          <p
            className={`text-sm sm:text-base mb-6 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            We implement industry-standard security measures like encryption,
            secure servers, and regular monitoring to protect your personal
            data. However, no method of transmission over the Internet is 100%
            secure, and we cannot guarantee absolute security.
          </p>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            Third-Party Links
          </h2>
          <p
            className={`text-sm sm:text-base mb-6 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            Our website may contain links to third-party websites. We are not
            responsible for the privacy practices or content of those websites.
          </p>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            Children's Privacy
          </h2>
          <p
            className={`text-sm sm:text-base mb-6 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            Our services are not intended for individuals under the age of 18.
            We do not knowingly collect personal information from minors.
          </p>

          <h2
            className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            Changes to This Privacy Policy
          </h2>
          <p
            className={`text-sm sm:text-base mb-6 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            We may update this Privacy Policy from time to time to reflect
            changes to our practices or for other operational, legal, or
            regulatory reasons. We encourage you to review this page regularly.
          </p>

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
            For questions about this Privacy Policy or your personal
            information, please contact:
          </p>
          <p
            className={`text-sm sm:text-base mb-6 ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            📧 Email:{" "}
            <a
              href="mailto:support@1scoopprotein.com"
              className={`${
                theme === "light" ? "text-yellow-600" : "text-yellow-400"
              } hover:underline`}
            >
              support@1scoopprotein.com
            </a>
          </p>
        </section>
      </div>
    </motion.div>
  );
}

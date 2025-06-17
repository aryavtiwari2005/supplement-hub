"use client";

import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";

export default function ShippingPolicyPage() {
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
                    Shipping{" "}
                    <span
                        className={`${theme === "light" ? "text-yellow-600" : "text-yellow-400"
                            }`}
                    >
                        Policy
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
                        Our Commitment
                    </h2>
                    <p
                        className={`text-sm sm:text-base mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-300"
                            }`}
                    >
                        At 1Scoop Protein, we are committed to fast, reliable, and transparent
                        shipping across India. We strive to ensure that your order reaches you
                        in the shortest time possible under normal circumstances.
                    </p>

                    <h2
                        className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${theme === "light" ? "text-gray-800" : "text-white"
                            }`}
                    >
                        Shipping Areas & Timelines
                    </h2>
                    <ul
                        className={`list-disc pl-5 mb-6 text-sm sm:text-base ${theme === "light" ? "text-gray-600" : "text-gray-300"
                            }`}
                    >
                        <li>
                            <strong>Noida:</strong> We offer 2-hour delivery for all orders
                            placed within Noida, subject to normal traffic and operational
                            conditions.
                        </li>
                        <li>
                            <strong>Delhi (excluding Noida):</strong> Orders are typically
                            delivered within 1 business day.
                        </li>
                        <li>
                            <strong>Rest of India:</strong> We offer nationwide shipping, with
                            delivery times ranging from 2 to 3 business days, depending on your
                            location and the courier網絡.
                        </li>
                    </ul>

                    <h2
                        className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${theme === "light" ? "text-gray-800" : "text-white"
                            }`}
                    >
                        Order Processing
                    </h2>
                    <ul
                        className={`list-disc pl-5 mb-6 text-sm sm:text-base ${theme === "light" ? "text-gray-600" : "text-gray-300"
                            }`}
                    >
                        <li>Orders placed before 5:00 PM are processed the same day.</li>
                        <li>
                            Orders placed after 5:00 PM are processed the next business day.
                        </li>
                        <li>Orders are not processed or shipped on Sundays or public holidays.</li>
                    </ul>

                    <h2
                        className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${theme === "light" ? "text-gray-800" : "text-white"
                            }`}
                    >
                        Shipping Confirmation & Tracking
                    </h2>
                    <p
                        className={`text-sm sm:text-base mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-300"
                            }`}
                    >
                        Once your order is shipped, you will receive a confirmation email or
                        SMS containing your tracking number and courier details so you can
                        monitor your shipment in real time.
                    </p>

                    <h2
                        className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${theme === "light" ? "text-gray-800" : "text-white"
                            }`}
                    >
                        Shipping Fees
                    </h2>
                    <ul
                        className={`list-disc pl-5 mb-6 text-sm sm:text-base ${theme === "light" ? "text-gray-600" : "text-gray-300"
                            }`}
                    >
                        <li>
                            Shipping fees, if applicable, will be calculated at checkout based
                            on your location and order size.
                        </li>
                        <li>
                            Any promotional free shipping offers will be clearly mentioned
                            during the checkout process.
                        </li>
                    </ul>

                    <h2
                        className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${theme === "light" ? "text-gray-800" : "text-white"
                            }`}
                    >
                        Delays & Exceptions
                    </h2>
                    <p
                        className={`text-sm sm:text-base mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-300"
                            }`}
                    >
                        While we aim to deliver within the timelines mentioned, unexpected
                        factors such as weather, courier delays, or high order volumes may
                        occasionally affect delivery schedules6. We appreciate your
                        understanding and patience in such cases.
                    </p>

                    <h2
                        className={`text-2xl sm:text-3xl font-bold mb-4 mt-8 ${theme === "light" ? "text-gray-800" : "text-white"
                            }`}
                    >
                        Contact Us
                    </h2>
                    <p
                        className={`text-sm sm:text-base mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-300"
                            }`}
                    >
                        For any questions or assistance regarding your shipment, please
                        contact:
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
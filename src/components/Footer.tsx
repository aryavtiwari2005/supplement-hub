"use client";

import React from "react";
import Link from "next/link";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";

const Footer: React.FC = () => {
  const theme = useSelector(selectTheme);

  return (
    <footer
      className={`
        py-16
        ${
          theme === "light"
            ? "bg-gradient-to-br from-yellow-50 to-white"
            : "bg-gradient-to-br from-gray-900 to-black"
        }
        ${theme === "light" ? "text-black" : "text-white"}
      `}
    >
      <div className="container mx-auto px-4 grid md:grid-cols-3 gap-12">
        {/* Company Info */}
        <div>
          <h2
            className={`
              text-3xl font-bold mb-6
              ${theme === "light" ? "text-yellow-600" : "text-blue-400"}
            `}
          >
            1Scoop Protein
          </h2>
          <p
            className={`
              mb-6
              ${theme === "light" ? "text-gray-700" : "text-gray-300"}
            `}
          >
            Your ultimate destination for premium nutrition and wellness
            supplements. Empowering fitness enthusiasts with high-quality
            nutritional solutions.
          </p>

          {/* Social Media Links */}
          <div className="flex space-x-4">
            {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map(
              (Icon, index) => (
                <Link
                  key={index}
                  href="#"
                  className={`
                    text-2xl transition
                    ${
                      theme === "light"
                        ? "text-yellow-600 hover:text-yellow-800"
                        : "text-blue-500 hover:text-blue-300"
                    }
                  `}
                >
                  <Icon />
                </Link>
              )
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3
            className={`
              text-2xl font-semibold mb-6
              ${theme === "light" ? "text-yellow-600" : "text-blue-400"}
            `}
          >
            Quick Links
          </h3>
          <div className="space-y-4">
            {[
              { href: "/", label: "Home" },
              { href: "/products", label: "Products" },
              { href: "/blogs", label: "Blogs" },
              { href: "/fitness-consultancy", label: "Fitness Consultancy" },
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/terms", label: "Terms of Service" },
              { href: "/refund", label: "Refund Policy" },
            ].map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className={`
                  block transition
                  ${
                    theme === "light"
                      ? "text-gray-700 hover:text-yellow-700"
                      : "text-gray-300 hover:text-blue-300"
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* About Us (Static Content) */}
        <div>
          <h3
            className={`
              text-2xl font-semibold mb-6
              ${theme === "light" ? "text-yellow-600" : "text-blue-400"}
            `}
          >
            About Us
          </h3>
          <p
            className={`
              mb-6
              ${theme === "light" ? "text-gray-700" : "text-gray-300"}
            `}
          >
            At 1Scoop Protein, we are passionate about helping you achieve your
            fitness goals. Our premium supplements are crafted with care to
            support your journey to a healthier, stronger you.
          </p>
          <p
            className={`
              ${theme === "light" ? "text-gray-700" : "text-gray-300"}
            `}
          >
            <strong>Store Hours:</strong> Mon-Sat, 9 AM - 9 PM
            <br />
            <strong>Location:</strong> Shop No-24, Ground Floor Galleria Market,
            Gaur City 2, Greater Noida (W)
          </p>
        </div>
      </div>

      {/* Contact Info and Copyright */}
      <div
        className={`
          container mx-auto px-4 mt-12 pt-6
          ${
            theme === "light"
              ? "border-t border-gray-200"
              : "border-t border-gray-800"
          }
        `}
      >
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 mb-4">
          {[
            { Icon: FaEnvelope, text: "supplementhub.contact@gmail.com" },
            { Icon: FaPhoneAlt, text: "+91 8860112296" },
            {
              Icon: FaMapMarkerAlt,
              text: "Shop No-24, Ground Floor Galleria Market, Gaur City 2, Greater Noida (W)",
            },
          ].map(({ Icon, text }, index) => (
            <div
              key={index}
              className={`
                flex items-center space-x-2
                ${theme === "light" ? "text-gray-700" : "text-gray-300"}
              `}
            >
              <Icon />
              <span>{text}</span>
            </div>
          ))}
        </div>

        <p
          className={`
            text-center mt-4
            ${theme === "light" ? "text-gray-500" : "text-gray-500"}
          `}
        >
          © {new Date().getFullYear()} Supplement Hub. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

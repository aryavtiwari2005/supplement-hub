"use client";

import React, { useState } from "react";
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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted", formData);
    setFormData({
      name: "",
      email: "",
      message: "",
    });
  };

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
              { href: "/about", label: "About Us" },
              { href: "/contact", label: "Contact" },
              { href: "/privacy", label: "Privacy Policy" },
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

        {/* Contact Form */}
        <div>
          <h3
            className={`
              text-2xl font-semibold mb-6
              ${theme === "light" ? "text-yellow-600" : "text-blue-400"}
            `}
          >
            Contact Us
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {["name", "email"].map((field) => (
              <input
                key={field}
                type={field === "email" ? "email" : "text"}
                name={field}
                placeholder={`Your ${
                  field.charAt(0).toUpperCase() + field.slice(1)
                }`}
                value={formData[field as keyof typeof formData]}
                onChange={handleInputChange}
                required
                className={`
                  w-full p-3 rounded-lg focus:outline-none focus:ring-2
                  ${
                    theme === "light"
                      ? "bg-gray-100 text-black focus:ring-yellow-500"
                      : "bg-gray-800 text-white focus:ring-blue-500"
                  }
                `}
              />
            ))}
            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={4}
              className={`
                w-full p-3 rounded-lg focus:outline-none focus:ring-2
                ${
                  theme === "light"
                    ? "bg-gray-100 text-black focus:ring-yellow-500"
                    : "bg-gray-800 text-white focus:ring-blue-500"
                }
              `}
            />
            <button
              type="submit"
              className={`
                w-full py-3 rounded-lg transition
                ${
                  theme === "light"
                    ? "bg-yellow-500 text-black hover:bg-yellow-600"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }
              `}
            >
              Send Message
            </button>
          </form>
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
            { Icon: FaEnvelope, text: "support@supplementhub.com" },
            { Icon: FaPhoneAlt, text: "(555) 123-4567" },
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

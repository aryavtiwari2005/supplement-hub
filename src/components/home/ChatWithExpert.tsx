"use client";
import { useState } from "react";
import { MessageCircle, X, UserCheck } from "lucide-react";

export default function ChatWithExpert() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  // WhatsApp link (replace with your actual WhatsApp number)
  const whatsappLink = "https://wa.me/8860112296"; // Example number

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Icon Button */}
      <button
        onClick={() => setIsPopupOpen(!isPopupOpen)}
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl focus:outline-none flex items-center justify-center transition-all duration-300 hover:shadow-green-400/50 hover:shadow-lg transform hover:scale-105 active:scale-95"
        aria-label="Chat with Expert"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Popup */}
      {isPopupOpen && (
        <div className="absolute bottom-20 right-0 bg-gradient-to-br from-green-600 to-green-700 text-white p-5 rounded-xl shadow-2xl w-80 transition-all duration-300 border border-white/10 backdrop-blur-sm">
          {/* Close Button */}
          <button
            onClick={() => setIsPopupOpen(false)}
            className="absolute top-2 right-2 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close popup"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="flex flex-col items-center space-y-4">
            {/* Expert Icon */}
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shadow-md border border-white/30">
              <UserCheck className="h-8 w-8 text-white" />
            </div>

            {/* Title */}
            <h3 className="font-bold text-lg">Need Help?</h3>

            {/* Description */}
            <p className="text-center text-white/80 text-sm">
              Our experts are ready to assist you with any questions
            </p>

            {/* WhatsApp Button */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 bg-white text-green-600 py-3 px-6 rounded-full w-full font-medium hover:bg-green-50 transition-colors shadow-md"
              onClick={() => setIsPopupOpen(false)}
            >
              <MessageCircle className="h-5 w-5" />
              <span>Chat with Expert</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, ArrowRight } from "lucide-react";
import { useTheme } from "../ThemeProvider";

interface User {
  id: number;
}

interface UserData {
  id: number;
  email: string;
  scoop_points: number;
  orders: any[];
}

const dropdownVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export default function ProfileDropdown() {
  const { theme } = useTheme();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user", { credentials: "include" });
      console.log("Fetch /api/user response status:", res.status);
      if (res.ok) {
        const { user: userResponse } = await res.json();
        console.log("User data from /api/user:", userResponse);
        setUser({ id: userResponse.id });
        setUserData({
          id: userResponse.id,
          email: userResponse.email,
          scoop_points: userResponse.scoopPoints,
          orders: userResponse.orders,
        });
      } else {
        console.log("No user data, setting to null");
        setUser(null);
        setUserData(null);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setUser(null);
      setUserData(null);
    }
  };

  useEffect(() => {
    console.log("Running useEffect to fetch user data on mount");
    fetchUserData();

    const handleAuthChange = () => {
      console.log("authChange event triggered");
      fetchUserData();
    };

    window.addEventListener("authChange", handleAuthChange);

    return () => {
      console.log("Cleaning up authChange listener");
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        console.log("Login successful, fetching user data");
        setEmail("");
        setPassword("");
        setIsProfileOpen(false);
        await fetchUserData(); // Fetch user data immediately after login
        window.dispatchEvent(new Event("authChange"));
      } else {
        const { message } = await res.json();
        setLoginError(message);
      }
    } catch (err) {
      setLoginError("Something went wrong. Please try again.");
      console.error("Login error:", err);
    }
  };

  const handleLogout = () => {
    console.log("Logging out");
    fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    })
      .then(() => {
        setUser(null);
        setUserData(null);
        setIsProfileOpen(false);
        router.push("/login");
        window.dispatchEvent(new Event("authChange"));
      })
      .catch((err) => console.error("Logout error:", err));
  };

  return (
    <div className="relative">
      <button
        className={`flex items-center space-x-2 ${
          theme === "light" ? "text-black" : "text-white"
        } hover:text-yellow-500 transition-colors px-3 py-2 rounded-md ${
          theme === "light" ? "bg-yellow-50" : "bg-gray-900"
        } cursor-pointer`}
        onClick={() => setIsProfileOpen(!isProfileOpen)}
      >
        <User className="w-6 h-6" />
        <span className="text-sm font-medium">
          {user ? "Profile" : "Login"}
        </span>
      </button>

      <AnimatePresence>
        {isProfileOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`absolute right-0 top-full mt-2 w-72 ${
              theme === "light" ? "bg-yellow-50" : "bg-gray-900"
            } rounded-lg shadow-xl border ${
              theme === "light" ? "border-gray-200" : "border-gray-800"
            } z-50`}
          >
            <div className="p-4">
              {user && userData ? (
                <>
                  <p
                    className={`${
                      theme === "light" ? "text-black" : "text-white"
                    } font-semibold`}
                  >
                    Hello, {userData.email}
                  </p>
                  <p
                    className={`${
                      theme === "light" ? "text-gray-500" : "text-gray-500"
                    } text-sm`}
                  >
                    Scoop Points: {userData.scoop_points || 0}
                  </p>
                  <div className="mt-4 space-y-2">
                    <Link
                      href="/profile"
                      className={`${
                        theme === "light" ? "text-black" : "text-white"
                      } block hover:text-yellow-500`}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/profile/orders"
                      className={`${
                        theme === "light" ? "text-black" : "text-white"
                      } block hover:text-yellow-500`}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-red-500 hover:text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label
                      className={`block mb-1 ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                          theme === "light" ? "text-gray-500" : "text-gray-500"
                        }`}
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 rounded-md ${
                          theme === "light"
                            ? "bg-white text-black"
                            : "bg-black text-white"
                        } ${
                          theme === "light"
                            ? "border-gray-200"
                            : "border-gray-800"
                        } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className={`block mb-1 ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                          theme === "light" ? "text-gray-500" : "text-gray-500"
                        }`}
                      />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 rounded-md ${
                          theme === "light"
                            ? "bg-white text-black"
                            : "bg-black text-white"
                        } ${
                          theme === "light"
                            ? "border-gray-200"
                            : "border-gray-800"
                        } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>
                  {loginError && (
                    <p className="text-red-500 text-sm">{loginError}</p>
                  )}
                  <motion.button
                    type="submit"
                    className="w-full bg-yellow-500 text-white py-2 rounded-md flex items-center justify-center space-x-2 hover:bg-yellow-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                  <p
                    className={`text-center ${
                      theme === "light" ? "text-gray-500" : "text-gray-500"
                    } text-sm`}
                  >
                    Don’t have an account?{" "}
                    <Link
                      href="/signup"
                      className="text-yellow-500 hover:text-yellow-600"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

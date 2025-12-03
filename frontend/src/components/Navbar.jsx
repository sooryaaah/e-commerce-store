import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Lock, LogOut, LogIn, UserPlus } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const Navbar = () => {
  const {user, logout} = useUserStore();
  const isAdmin = user?.role === "admin";

  const {cart} = useCartStore();

  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 border-b border-emerald-900">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center space-x-2 text-2xl font-bold text-emerald-400"
          >
            <span className="group-hover:text-emerald-300 transition">E-commerce</span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-4">

            {/* Home */}
            <Link
              to="/"
              className="group text-gray-300 transition"
            >
              <span className="group-hover:text-emerald-400">Home</span>
            </Link>

            {/* Cart (only if user logged in) */}
            {user && (
              <Link
                to="/cart"
                className="group relative flex items-center text-gray-300 transition"
              >
                <ShoppingCart
                  className="inline-block mr-1 transition group-hover:text-emerald-400"
                  size={20}
                />
                <span className="hidden sm:inline transition group-hover:text-emerald-400">
                  Cart
                </span>

                {/* Cart Count Badge */}
                {cart.length> 0 && <span className="absolute -top-2 -left-2 bg-emerald-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {cart.length}
                </span>}
              </Link>
            )}

            {/* Admin Dashboard */}
            {isAdmin && (
              <Link
                className="group flex items-center bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md transition"
                to="/secret-dashboard"
              >
                <Lock size={18} className="mr-1" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}

            {/* User Auth Buttons */}
            {user ? (
              <button onClick={logout}
                className="group flex items-center bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline ml-2">Log Out</span>
              </button>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="group flex items-center bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition"
                >
                  <UserPlus className="mr-2" size={18} />
                  Sign Up
                </Link>

                <Link
                  to="/login"
                  className="group flex items-center bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition"
                >
                  <LogIn className="mr-2" size={18} />
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

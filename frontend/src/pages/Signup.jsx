import { useState, useEffect } from "react";
import React from "react"
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearError } from "../store/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";


function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(resultAction)) {
      alert(resultAction.payload.message);
      navigate("/login");
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex overflow-visible bg-primary-dark"
      style={{
        backgroundImage: "url('/src/assets/auth-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Palette Overlay */}
      <div className="absolute inset-0 bg-primary-dark/50 z-0"></div>


      {/* Main Grid Layout */}
      <div className="relative z-10 w-full h-full grid grid-cols-1 md:grid-cols-2">
        {/* Left Section - Form */}
        <div className="flex flex-col justify-center items-center px-4 md:px-12 min-h-screen pt-24 md:pt-0">
          <div className="w-full max-w-[460px]">
            {/* Form Card */}
            <div className="bg-beige-50 rounded-2xl shadow-2xl p-6 md:p-10 border border-beige-300">
              <div className="mb-6 md:mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-primary-dark mb-3 md:mb-4 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Create Account
                </h1>
                <p className="text-sm text-[#1e3a40]/70 text-center">
                  Join thousands styling smarter
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Full name"
                    onChange={handleChange}
                    className="w-full bg-white border border-beige-300 rounded-lg px-4 py-3 text-sm text-primary-dark placeholder:text-primary-dark/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Email address"
                    onChange={handleChange}
                    className="w-full bg-white border border-beige-300 rounded-lg px-4 py-3 text-sm text-primary-dark placeholder:text-primary-dark/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    className="w-full bg-white border border-beige-300 rounded-lg px-4 py-3 text-sm text-primary-dark placeholder:text-primary-dark/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-hover text-[#1e3a40] font-bold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                >
                  Sign Up
                </button>
              </form>

              <p className="text-center text-sm text-[#1e3a40]/70 mt-6">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary-dark font-bold hover:underline transition-all"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Content */}
        <div className="hidden md:flex flex-col justify-center px-12">
          <div className="max-w-sm">
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight italic" style={{ fontFamily: "'Playfair Display', serif" }}>
              Style smarter, not harder.
            </h2>
            <p className="text-xl text-white/95 leading-relaxed font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
              ReFitly understands your wardrobe, your body shape, and your past outfits to create combinations that actually work for you. No more guesswork, no more repeated looks — just effortless styling, every single day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
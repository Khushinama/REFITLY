import { useState, useEffect } from "react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../store/slices/authSlice";
import { forgotPassword } from "../services/authService";
import { useNavigate, Link, useLocation } from "react-router-dom";


function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("verified") === "true") {
      alert("Email verified successfully! You can now log in.");
    }
  }, [location]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (!user.bodyType) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  const handleForgotPassword = async () => {
    if (!form.email) {
      return alert("Enter email first");
    }

    const resultAction = await dispatch(forgotPasswordThunk(form.email));
    if (forgotPasswordThunk.fulfilled.match(resultAction)) {
      alert(resultAction.payload.message);
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
                  Welcome Back
                </h1>
                <p className="text-sm text-primary-dark/70 text-center">
                  Sign in to access your wardrobe
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value.trim() })
                    }
                    className="w-full bg-white border border-beige-300 rounded-lg px-4 py-3 text-sm text-primary-dark placeholder:text-primary-dark/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full bg-white border border-beige-300 rounded-lg px-4 py-3 text-sm text-primary-dark placeholder:text-primary-dark/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                       className="text-xs font-bold text-primary-dark hover:underline transition-all"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                 <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-hover text-[#1e3a40] font-bold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                >
                  Sign In
                </button>
              </form>

               <p className="text-center text-sm text-primary-dark/70 mt-6">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-primary-dark font-bold hover:underline transition-all"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Content */}
        <div className="hidden md:flex flex-col justify-center px-12">
          <div className="max-w-sm">
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight italic" style={{ fontFamily: "'Playfair Display', serif" }}>
              Welcome back.
            </h2>
            <p className="text-xl text-white/95 leading-relaxed font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
              Pick up right where you left off and let ReFitly handle your outfits effortlessly. Your wardrobe is smarter, your style is easier — and your perfect outfit is just a step away.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

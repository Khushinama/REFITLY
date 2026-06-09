import { useState, useEffect } from "react";
import React from "react";
import authBg from "../assets/auth-bg.jpg";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError, forgotPasswordThunk } from "../store/slices/authSlice";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "../components/Input";
import { PasswordInput } from "../components/PasswordInput";
import { validateEmail } from "../utils/validation";
import BrandLogo from "../components/common/BrandLogo";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      const isMissingOnboarding = !user.onboardingCompleted || user.gender === "Prefer not to say" || !user.gender;
      if (isMissingOnboarding) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "email") setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    if (name === "password") setErrors(prev => ({ ...prev, password: value ? "" : "Password is required" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailErr = validateEmail(form.email);
    const passErr = form.password ? "" : "Password is required";

    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      return;
    }

    dispatch(loginUser(form));
  };

  const handleForgotPassword = async () => {
    if (!form.email) {
      setErrors(prev => ({ ...prev, email: "Please enter your email address first" }));
      return toast.error("Please enter your email address first.");
    }
    
    const emailErr = validateEmail(form.email);
    if (emailErr) {
      setErrors(prev => ({ ...prev, email: emailErr }));
      return;
    }

    const resultAction = await dispatch(forgotPasswordThunk(form.email));
    if (forgotPasswordThunk.fulfilled.match(resultAction)) {
      toast.success(resultAction.payload?.message || "Password reset email sent.");
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex overflow-visible bg-primary-dark"
      style={{
        backgroundImage: `url(${authBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Brand Logo in top left */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50 bg-white/70 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-white/20">
        <BrandLogo onClick={() => navigate("/")} />
      </div>

      {/* Palette Overlay */}
      <div className="absolute inset-0 bg-primary-dark/60 z-0 backdrop-blur-[2px]"></div>


      {/* Main Grid Layout */}
      <div className="relative z-10 w-full h-full grid grid-cols-1 md:grid-cols-2">
        {/* Left Section - Form */}
        <div className="flex flex-col justify-center items-center px-4 md:px-12 min-h-screen pt-24 md:pt-0">
          <div className="w-full max-w-[460px]">
            {/* Form Card */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-10 border border-beige-300">
              <div className="mb-6 md:mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-primary-dark mb-3 md:mb-4 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Welcome Back
                </h1>
                <p className="text-sm text-primary-dark/70 text-center">
                  Sign in to access your wardrobe
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleChange}
                  error={errors.email}
                  disabled={loading}
                />

                <div className="relative">
                  <PasswordInput
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    showStrength={false}
                    disabled={loading}
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
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
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

import { useState, useEffect, useRef } from "react";
import React from "react"
import authBg from "../assets/auth-bg.jpg";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, verifyOtpThunk, resendOtpThunk, clearError } from "../store/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "../components/Input";
import { PasswordInput } from "../components/PasswordInput";
import { validateName, validateEmail, validatePassword, validateOTP } from "../utils/validation";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  
  const [errors, setErrors] = useState({});

  const [showOtp, setShowOtp] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  
  const inputRefs = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    let interval;
    if (showOtp && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showOtp, timer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Live validation
    if (name === "name") setErrors(prev => ({ ...prev, name: validateName(value) }));
    if (name === "email") setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    if (name === "password") setErrors(prev => ({ ...prev, password: validatePassword(value) }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const nameErr = validateName(form.name);
    const emailErr = validateEmail(form.email);
    const passErr = validatePassword(form.password);

    if (nameErr || emailErr || passErr) {
      setErrors({ name: nameErr, email: emailErr, password: passErr });
      return;
    }

    const resultAction = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(resultAction)) {
      setRegisteredEmail(resultAction.payload.email || form.email);
      setShowOtp(true);
      setTimer(60);
      toast.success("Registration successful. Please check your email for OTP.");
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    const newOtp = [...otp];
    pastedData.forEach((char, index) => {
      if (!isNaN(char) && index < 6) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    if (lastFilledIndex >= 0) {
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    const otpErr = validateOTP(otpValue);
    
    if (otpErr) {
      return toast.error(otpErr);
    }
    
    const resultAction = await dispatch(verifyOtpThunk({ email: registeredEmail, otp: otpValue }));
    if (verifyOtpThunk.fulfilled.match(resultAction)) {
      toast.success("Email verified successfully! You can now log in.");
      navigate("/login");
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    const resultAction = await dispatch(resendOtpThunk(registeredEmail));
    if (resendOtpThunk.fulfilled.match(resultAction)) {
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      toast.success("A new OTP has been sent.");
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
      {/* Palette Overlay */}
      <div className="absolute inset-0 bg-primary-dark/60 z-0 backdrop-blur-[2px]"></div>

      {/* Main Grid Layout */}
      <div className="relative z-10 w-full h-full grid grid-cols-1 md:grid-cols-2">
        {/* Left Section - Form */}
        <div className="flex flex-col justify-center items-center px-4 md:px-12 min-h-screen pt-24 md:pt-0">
          <div className="w-full max-w-[460px] relative">
            <AnimatePresence mode="wait">
              {!showOtp ? (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-10 border border-beige-300"
                >
                  <div className="mb-6 md:mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-primary-dark mb-3 md:mb-4 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Create Account
                    </h1>
                    <p className="text-sm text-primary-dark/70 text-center">
                      Join thousands styling smarter
                    </p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-6">
                    <Input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="Full name"
                      value={form.name}
                      onChange={handleChange}
                      error={errors.name}
                      disabled={loading}
                    />
                    
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="Email address"
                      value={form.email}
                      onChange={handleChange}
                      error={errors.email}
                      disabled={loading}
                    />
                    
                    <PasswordInput
                      id="password"
                      name="password"
                      placeholder="Password"
                      value={form.password}
                      onChange={handleChange}
                      error={errors.password}
                      showStrength={true}
                      disabled={loading}
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
                    </button>
                  </form>

                  <p className="text-center text-sm text-primary-dark/70 mt-6">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-primary-dark font-bold hover:underline transition-all"
                    >
                      Sign in
                    </Link>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-10 border border-beige-300 relative"
                >
                  <button 
                    onClick={() => setShowOtp(false)}
                    className="absolute top-6 left-6 text-primary-dark/60 hover:text-primary-dark transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="mb-6 md:mb-8 mt-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-primary-dark mb-3 md:mb-4 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Verify Email
                    </h1>
                    <p className="text-sm text-primary-dark/70 text-center px-4">
                      We've sent a 6-digit verification code to <br /><span className="font-semibold">{registeredEmail}</span>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                      {otp.map((data, index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength="1"
                          ref={(el) => (inputRefs.current[index] = el)}
                          value={data}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-10 h-12 sm:w-12 sm:h-14 bg-beige-50 border border-beige-300 rounded-lg text-center text-xl font-bold text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otp.join("").length < 6}
                      className="w-full flex items-center justify-center bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Account"}
                    </button>
                  </form>

                  <div className="text-center mt-6">
                    <button
                      type="button"
                      disabled={timer > 0 || loading}
                      onClick={handleResendOtp}
                      className="text-sm font-bold text-primary-dark hover:underline disabled:opacity-50 disabled:no-underline transition-all"
                    >
                      {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
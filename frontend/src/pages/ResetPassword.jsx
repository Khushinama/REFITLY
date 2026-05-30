import { useState, useEffect } from "react";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPasswordThunk, clearError } from "../store/slices/authSlice";
import { PasswordInput } from "../components/PasswordInput";
import { validatePassword } from "../utils/validation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";


function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setErrors(prev => ({ ...prev, password: validatePassword(val) }));
  };

  const handleConfirmPasswordChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);
    if (val !== password) {
      setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
    } else {
      setErrors(prev => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passErr = validatePassword(password);
    const confirmErr = password !== confirmPassword ? "Passwords do not match" : "";

    if (passErr || confirmErr) {
      setErrors({ password: passErr, confirmPassword: confirmErr });
      return;
    }

    const resultAction = await dispatch(resetPasswordThunk({ token, password }));
    if (resetPasswordThunk.fulfilled.match(resultAction)) {
      toast.success(resultAction.payload.message || "Password reset successfully");
      navigate("/login");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-beige-200 p-4 overflow-visible">


      <div className="bg-beige-50 p-8 rounded-2xl shadow-lg border border-beige-300 w-full max-w-[400px] transition-all duration-300 relative z-10">
        <h2 className="text-4xl font-bold mb-8 text-primary-dark text-center tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Reset Password</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PasswordInput
            id="password"
            name="password"
            placeholder="New Password"
            value={password}
            onChange={handlePasswordChange}
            error={errors.password}
            showStrength={true}
            disabled={loading}
          />
          
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            error={errors.confirmPassword}
            showStrength={false}
            disabled={loading}
          />

          <button 
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-bold shadow-md transform hover:scale-[1.02] transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
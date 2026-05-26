import { useState, useEffect } from "react";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPasswordThunk, clearError } from "../store/slices/authSlice";


function ResetPassword() {
  const [password, setPassword] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password) {
      return alert("Enter new password");
    }

    const resultAction = await dispatch(resetPasswordThunk({ token, password }));
    if (resetPasswordThunk.fulfilled.match(resultAction)) {
      alert(resultAction.payload.message);
      navigate("/login");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-beige-200 p-4 overflow-visible">


      <div className="bg-beige-50 p-8 rounded-2xl shadow-lg border border-beige-300 w-full max-w-[400px] transition-all duration-300 relative z-10">
        <h2 className="text-4xl font-bold mb-8 text-primary-dark text-center tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Reset Password</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-primary-dark/70" htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-white border border-beige-300 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all duration-200 placeholder:text-primary-dark/40 text-primary-dark"
            />
          </div>

          <button className="w-full bg-primary hover:bg-primary-hover text-[#1e3a40] py-3 rounded-lg font-bold shadow-md transform hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
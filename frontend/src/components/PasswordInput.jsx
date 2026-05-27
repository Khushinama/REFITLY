import React, { useState } from "react";
import { Input } from "./Input";
import { Eye, EyeOff } from "lucide-react";
import { checkPasswordStrength } from "../utils/validation";
import { motion, AnimatePresence } from "framer-motion";

export const PasswordInput = React.forwardRef(({ showStrength = false, error, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const password = props.value || "";

  const strength = checkPasswordStrength(password);
  const allCriteriaMet = Object.values(strength).every(Boolean);

  const criteriaList = [
    { key: "length", label: "Min 8 chars" },
    { key: "uppercase", label: "Uppercase letter" },
    { key: "lowercase", label: "Lowercase letter" },
    { key: "number", label: "Number" },
    { key: "special", label: "Special char" },
  ];

  return (
    <div className="w-full relative pb-4">
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? "text" : "password"}
          error={error}
          success={showStrength && password && allCriteriaMet}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-primary-dark/40 hover:text-primary-dark transition-colors"
          tabIndex="-1"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {showStrength && isFocused && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-2"
          >
            <div className="bg-white/80 border border-beige-200 rounded-md p-3 text-xs shadow-sm">
              <p className="font-semibold text-primary-dark mb-2">Password Requirements:</p>
              <div className="grid grid-cols-2 gap-1">
                {criteriaList.map((item) => (
                  <div
                    key={item.key}
                    className={`flex items-center gap-1 ${
                      strength[item.key] ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {strength[item.key] ? "✓" : "○"} {item.label}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";

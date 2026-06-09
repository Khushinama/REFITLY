import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Input = React.forwardRef(({ label, error, success, className = "", ...props }, ref) => {
  const isError = Boolean(error);
  const isSuccess = Boolean(success && !error);

  return (
    <div className="flex flex-col gap-1 w-full relative">
      {label && <label className="text-sm font-semibold text-primary-dark">{label}</label>}
      <motion.div
        animate={isError ? { x: [-5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <input
          ref={ref}
          className={`w-full bg-beige-50 border rounded-lg px-4 py-3 text-sm text-primary-dark placeholder:text-primary-dark/40 focus:outline-none focus:ring-2 transition-all duration-200
            ${isError ? "border-red-500 focus:ring-red-500" : isSuccess ? "border-green-500 focus:ring-green-500" : "border-beige-300 focus:ring-primary focus:border-transparent"}
            ${props.disabled ? "opacity-60 cursor-not-allowed bg-gray-100" : ""}
            ${className}`}
          {...props}
        />
      </motion.div>
      <AnimatePresence>
        {isError && (
          <motion.span
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            className="text-xs text-red-500 mt-1 font-medium block overflow-hidden"
          >
            <div className="pt-1">{error}</div>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = "Input";

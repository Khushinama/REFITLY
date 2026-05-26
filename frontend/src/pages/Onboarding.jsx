import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateBodyTypeThunk } from "../store/slices/authSlice";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import BrandLogo from "../components/common/BrandLogo";

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const questions = [
    {
      question:
        "How would you describe your shoulder width relative to your hips?",
      options: [
        {
          label:
            "My shoulders and hips are about the same width",
          value: "A",
        },
        {
          label: "My shoulders are narrower than my hips",
          value: "B",
        },
        {
          label:
            "My shoulders and hips are balanced with a narrow waist",
          value: "C",
        },
        {
          label: "My shoulders are wider than my hips",
          value: "D",
        },
      ],
    },
    {
      question:
        "Which part of your body do you feel is most prominent?",
      options: [
        {
          label:
            "Everything feels pretty balanced and straight",
          value: "A",
        },
        {
          label:
            "My hips and thighs are the main focus",
          value: "B",
        },
        {
          label:
            "My bust and hips are equally prominent",
          value: "C",
        },
        {
          label:
            "My shoulders or bust are my broadest part",
          value: "D",
        },
      ],
    },
    {
      question:
        "How would you describe your waistline?",
      options: [
        {
          label: "Straight and not very defined",
          value: "A",
        },
        {
          label:
            "Relatively defined but carries weight lower",
          value: "B",
        },
        {
          label:
            "Very narrow and clearly defined",
          value: "C",
        },
        {
          label:
            "Straight with weight concentrated upward",
          value: "D",
        },
      ],
    },
    {
      question:
        "Where do you typically notice weight gain first?",
      options: [
        {
          label:
            "Evenly distributed across my midsection",
          value: "A",
        },
        {
          label:
            "Mostly in my hips, thighs, and booty",
          value: "B",
        },
        {
          label:
            "In both my bust and my hip area",
          value: "C",
        },
        {
          label:
            "In my upper body, arms, or midsection",
          value: "D",
        },
      ],
    },
  ];

  const totalSteps = questions.length;

  const handleOptionSelect = (value) => {
    setSelectedOption(value);
  };

  const handleNext = async () => {
    if (selectedOption === null) return;

    const updatedAnswers = [...answers, selectedOption];

    setAnswers(updatedAnswers);
    setSelectedOption(null);

    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      await submitQuiz(updatedAnswers);
    }
  };

  const submitQuiz = async (finalAnswers) => {
    setIsLoading(true);

    const resultAction = await dispatch(
      updateBodyTypeThunk(finalAnswers)
    );

    if (updateBodyTypeThunk.fulfilled.match(resultAction)) {
      setResult(resultAction.payload.bodyType);
    } else {
      alert(
        resultAction.payload ||
        "Failed to save body type. Please try again."
      );
    }

    setIsLoading(false);
  };

  const progress = ((step + 1) / totalSteps) * 100;

  // =========================
  // RESULT SCREEN
  // =========================

  if (result) {
    return (
      <div className="min-h-screen bg-[#F6F1E8] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[500px] bg-white rounded-[32px] shadow-[0_20px_80px_rgba(0,0,0,0.08)] p-10 border border-[#E8DED0] text-center animate-in fade-in zoom-in duration-500">

          <div className="w-24 h-24 bg-[#AACDDC]/20 rounded-full flex items-center justify-center mx-auto mb-8 text-[#81A6C6]">
            <CheckCircle2 size={52} />
          </div>

          <h2 className="text-[34px] font-black text-[#1A1A2E] mb-3 tracking-tight">
            Analysis Complete
          </h2>

          <p className="text-[#7B7B8B] mb-10 font-medium text-[15px]">
            Your personal styling profile is ready.
          </p>

          <div className="bg-[#F9F6F1] rounded-[28px] p-8 mb-10 border border-[#EFE6D8]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#81A6C6] font-bold mb-3">
              Your Body Type
            </p>

            <h3 className="text-[42px] font-black text-[#1A1A2E] tracking-tight">
              {result}
            </h3>
          </div>

          <p className="text-[#8A8A9A] text-sm leading-relaxed mb-10 italic">
            "Your proportions create a naturally balanced silhouette
            that allows elegant styling versatility."
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-[#81A6C6] hover:bg-[#96B8D2] text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Go To Dashboard
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // MAIN SCREEN
  // =========================

  return (
    <div className="min-h-screen bg-[#F6F1E8] flex flex-col items-center justify-start pt-5 pb-10 px-6 font-sans">
      {/* Top Header Row */}
      {/* =========================
     HEADER - Centered Layout
     ========================= */}
<div className="w-full max-w-[760px] flex flex-row items-center mb-14">

  {/* Logo - Smaller & Centered */}
  <BrandLogo />

  {/* Pills - Centered Below Logo */}
  <div className="flex items-center gap-3 flex-wrap justify-center">
    <div className="px-7 py-2.5 rounded-full bg-white/90 border border-[#E8E0D0] text-[#1A1A2E] text-[11px] font-bold tracking-[0.5px] uppercase shadow-sm">
      STYLE ANALYSIS
    </div>

    <div className="px-7 py-2.5 rounded-full bg-white/90 border border-[#E8E0D0] text-[#8A8A9A] text-[11px] font-bold tracking-[0.5px] uppercase shadow-sm">
      STEP {step + 1} OF {totalSteps}
    </div>
  </div>

</div>

      {/* Main Card */}
      <div className="w-full max-w-[760px] bg-white rounded-[36px] shadow-[0_20px_80px_rgba(0,0,0,0.06)] border border-[#E8DED0] relative overflow-hidden transition-all duration-500">

        {/* Top Progress */}
        <div className="absolute top-0 left-0 w-full h-[6px] bg-[#F3E8DA]">
          <div
            className="h-full bg-[#81A6C6] transition-all duration-500 ease-out rounded-r-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-10 md:p-14">

          {/* Question Count */}
          <p className="text-[#81A6C6] font-black text-xs uppercase tracking-[0.25em] mb-5">
            Question {step + 1}
          </p>

          {/* Question */}
          <h2 className="text-[34px] md:text-[42px] font-black text-[#1A1A2E] leading-[1.15] tracking-tight mb-12 max-w-[650px]">
            {questions[step].question}
          </h2>

          {/* Options */}
          <div className="space-y-5">

            {questions[step].options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionSelect(option.value)}
                className={`w-full text-left p-6 rounded-[24px] border-2 transition-all duration-300 group flex items-start gap-5 ${selectedOption === option.value
                  ? "bg-[#AACDDC]/15 border-[#81A6C6] shadow-lg -translate-y-1"
                  : "bg-[#FFFDFC] border-[#EFE4D6] hover:border-[#AACDDC] hover:bg-[#F7F3ED]"
                  }`}
              >

                {/* Radio */}
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center mt-1 shrink-0 transition-all ${selectedOption === option.value
                    ? "border-[#81A6C6] bg-[#81A6C6]"
                    : "border-[#D7CABC]"
                    }`}
                >
                  {selectedOption === option.value && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                  )}
                </div>

                {/* Text */}
                <span
                  className={`text-[16px] md:text-[17px] leading-relaxed font-semibold transition-colors ${selectedOption === option.value
                    ? "text-[#1A1A2E]"
                    : "text-[#5F6172]"
                    }`}
                >
                  {option.label}
                </span>

              </button>
            ))}

          </div>

          {/* Button */}
          <button
            disabled={selectedOption === null || isLoading}
            onClick={handleNext}
            className={`w-full mt-12 py-5 rounded-[22px] font-black text-[16px] flex items-center justify-center gap-3 transition-all duration-300 ${selectedOption !== null && !isLoading
              ? "bg-[#81A6C6] text-white hover:bg-[#96B8D2] shadow-xl hover:-translate-y-1"
              : "bg-[#F2F2F2] text-[#A0A0A0] cursor-not-allowed opacity-70"
              }`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                {step === totalSteps - 1
                  ? "Finish Analysis"
                  : "Next Question"}

                <ArrowRight size={18} />
              </>
            )}
          </button>

        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs tracking-wide text-[#A5A5B0] font-medium">
        Secure & Private Analysis • ReFitly AI
      </p>
    </div>
  );
};

export default Onboarding;
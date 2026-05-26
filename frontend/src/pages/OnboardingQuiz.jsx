import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateBodyTypeThunk } from "../store/slices/authSlice";
import BrandLogo from "../components/common/BrandLogo";

const OnboardingQuiz = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [subStep, setSubStep] = useState(0); // 0: Result, 1: Skin Tone, 2: Style, 3: Colors
  const [skinTone, setSkinTone] = useState("");
  const [stylePreference, setStylePreference] = useState([]);
  const [favoriteColors, setFavoriteColors] = useState([]);

  const skinTones = [
    { label: "Warm", value: "warm", desc: "Golden, yellow, or peach undertones" },
    { label: "Cool", value: "cool", desc: "Pink, red, or bluish undertones" },
    { label: "Neutral", value: "neutral", desc: "A mix of warm and cool undertones" },
  ];

  const styleOptions = ["Minimal", "Classy", "Streetwear", "Bohemian", "Trendy"];

  const colorOptions = [
    { name: "Midnight", hex: "#1A1A2E" },
    { name: "Ocean", hex: "#81A6C6" },
    { name: "Sage", hex: "#9CAF88" },
    { name: "Sand", hex: "#D9C5B2" },
    { name: "Earth", hex: "#8C7B6D" },
    { name: "Rose", hex: "#D4A5A5" },
    { name: "Slate", hex: "#4A5568" },
    { name: "Cream", hex: "#F5F5DC" },
  ];
  const questions = [
    {
      question: "How would you describe your shoulder width relative to your hips?",
      options: [
        { label: "My shoulders and hips are about the same width", value: "A" },
        { label: "My shoulders are narrower than my hips", value: "B" },
        { label: "My shoulders and hips are balanced with a narrow waist", value: "C" },
        { label: "My shoulders are wider than my hips", value: "D" },
      ],
    },
    {
      question: "Which part of your body do you feel is most prominent?",
      options: [
        { label: "Everything feels pretty balanced and straight", value: "A" },
        { label: "My hips and thighs are the main focus", value: "B" },
        { label: "My bust and hips are equally prominent", value: "C" },
        { label: "My shoulders or bust are my broadest part", value: "D" },
      ],
    },
    {
      question: "How would you describe your waistline?",
      options: [
        { label: "Straight and not very defined", value: "A" },
        { label: "Relatively defined but carries weight lower", value: "B" },
        { label: "Very narrow and clearly defined", value: "C" },
        { label: "Straight with weight concentrated upward", value: "D" },
      ],
    },
    {
      question: "Where do you typically notice weight gain first?",
      options: [
        { label: "Evenly distributed across my midsection", value: "A" },
        { label: "Mostly in my hips, thighs, and booty", value: "B" },
        { label: "In both my bust and my hip area", value: "C" },
        { label: "In my upper body, arms, or midsection", value: "D" },
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
    const resultAction = await dispatch(updateBodyTypeThunk(finalAnswers));
    if (updateBodyTypeThunk.fulfilled.match(resultAction)) {
      setResult(resultAction.payload.bodyType);
    } else {
      alert(resultAction.payload || "Failed to save body type. Please try again.");
    }
    setIsLoading(false);
  };

  const handleStyleProfileSubmit = async () => {
    setIsLoading(true);
    const styleData = {
      skinTone,
      stylePreference,
      favoriteColors,
      bodyType: result
    };
    
    // We can also import and use saveStyleProfileThunk here
    // For simplicity and since I'm extending existing code:
    const { saveStyleProfileThunk } = await import("../store/slices/authSlice");
    const resultAction = await dispatch(saveStyleProfileThunk(styleData));
    
    if (saveStyleProfileThunk.fulfilled.match(resultAction)) {
      navigate("/dashboard");
    } else {
      alert(resultAction.payload || "Failed to save style profile.");
    }
    setIsLoading(false);
  };

  const handleNextSubStep = () => {
    if (subStep < 3) {
      setSubStep(subStep + 1);
    } else {
      handleStyleProfileSubmit();
    }
  };

  const toggleStyle = (style) => {
    setStylePreference(prev => 
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const toggleColor = (color) => {
    setFavoriteColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const currentProgress = ((step + 1) / totalSteps) * 100;

  // Result Screen
  if (result) {
    return (
      <div className="min-h-screen bg-[#F7F0E8] overflow-x-hidden font-inter selection:bg-[#AACDDC]/30 flex justify-center">
        <div className="w-full md:w-[85%] lg:w-[70%] px-6 py-12 md:px-16 lg:px-24 pt-8 md:pt-8 flex flex-col gap-10 animate-in fade-in duration-500 zoom-in-95 fill-mode-both">

          <div className="flex flex-wrap items-center justify-start gap-3">
            <span className="bg-[#EFE6D9] text-[#81A6C6] text-[10px] font-medium tracking-[0.15em] uppercase rounded-full px-4 py-1.5 border border-[#81A6C6]/15">
              ✦ {subStep === 0 ? "Your Result" : `Step ${subStep + 1} of 4`}
            </span>
            <span className="bg-[#AACDDC]/18 text-[#3D3D4E] text-[10px] font-medium tracking-[0.1em] uppercase rounded-full px-4 py-1.5">
              {subStep === 0 ? "Style Profile Complete" : "Personalizing Your Experience"}
            </span>
          </div>

          {subStep === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-4">
                <p className="text-[#8A8A9A] text-xl font-normal font-playfair">You're an</p>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-normal text-[#81A6C6] font-playfair leading-tight">
                  {result}
                </h1>
              </div>
              <p className="text-base md:text-lg text-[#3D3D4E] max-w-md leading-relaxed font-inter">
                Your silhouette carries a unique balance. ReFitly will now suggest cuts and fabrics that celebrate your natural proportions and effortless elegance.
              </p>
            </div>
          )}

          {subStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl font-normal text-[#1A1A2E] font-playfair">What's your skin tone?</h2>
                <p className="text-[#8A8A9A] text-sm md:text-base font-inter">This helps us recommend colors that make you glow.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {skinTones.map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => setSkinTone(tone.value)}
                    className={`p-6 rounded-2xl text-left transition-all duration-300 border ${
                      skinTone === tone.value 
                        ? 'bg-[#AACDDC]/18 border-[#81A6C6] shadow-md' 
                        : 'bg-white/50 border-transparent hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <p className={`font-medium mb-1 ${skinTone === tone.value ? 'text-[#1A1A2E]' : 'text-[#3D3D4E]'}`}>{tone.label}</p>
                    <p className="text-[11px] text-[#8A8A9A] leading-relaxed">{tone.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {subStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl font-normal text-[#1A1A2E] font-playfair">Your style vibe?</h2>
                <p className="text-[#8A8A9A] text-sm md:text-base font-inter">Select any that resonate with you.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {styleOptions.map((style) => (
                  <button
                    key={style}
                    onClick={() => toggleStyle(style)}
                    className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 border ${
                      stylePreference.includes(style)
                        ? 'bg-[#81A6C6] text-white border-[#81A6C6] shadow-md'
                        : 'bg-[#EFE6D9] text-[#3D3D4E] border-transparent hover:bg-[#E2D4C1]'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          )}

          {subStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl font-normal text-[#1A1A2E] font-playfair">Favorite colors?</h2>
                <p className="text-[#8A8A9A] text-sm md:text-base font-inter">Pick colors you love to wear.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {colorOptions.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => toggleColor(color.name)}
                    className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 border ${
                      favoriteColors.includes(color.name)
                        ? 'bg-[#AACDDC]/18 border-[#81A6C6]'
                        : 'bg-white/40 border-transparent hover:bg-white'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-full shadow-inner border border-black/5" 
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className={`text-xs font-medium ${favoriteColors.includes(color.name) ? 'text-[#1A1A2E]' : 'text-[#8A8A9A]'}`}>
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="h-[1px] bg-[#81A6C6]/10 max-w-xs my-4" />

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <button
              disabled={isLoading}
              onClick={handleNextSubStep}
              className="group w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 bg-[#81A6C6] text-white rounded-full text-sm font-medium tracking-wide shadow-lg transition-all duration-300 ease-out hover:bg-[#6B90B0] hover:translate-x-1 hover:shadow-[0_8px_24px_rgba(129,166,198,0.35)]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>{subStep === 3 ? "Complete My Profile →" : "Continue →"}</>
              )}
            </button>

            {subStep > 0 && (
              <button
                disabled={isLoading}
                onClick={() => navigate("/dashboard")}
                className="w-full sm:w-auto text-[#8A8A9A] text-xs font-medium tracking-widest uppercase hover:text-[#3D3D4E] transition-colors py-2"
              >
                Skip for now
              </button>
            )}

            {subStep === 0 && !isLoading && (
              <div className="text-[10px] tracking-widest text-[#8A8A9A] uppercase animate-in fade-in duration-700">
                ✓ Body type saved
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Question Step Screen
  return (
    // ─── PAGE ROOT: left-aligned, NOT centered ───────────────────────────────
    // We use `items-start` so the content column hugs the left side.
    // The container is NOT centered with mx-auto — it starts from the left edge.
    <div className="min-h-screen bg-[#F7F0E8] overflow-x-hidden selection:bg-[#AACDDC]/30 font-inter flex justify-center">

      {/* CONTENT COLUMN — Centered with responsive width */}
      <div className="w-full md:w-[85%] lg:w-[70%] px-4 md:px-16 lg:px-24 pt-8 md:pt-8 flex flex-col gap-12 md:gap-16">

        {/* ── HEADER: tags + headline + subtext — all left-aligned ─────────── */}
        <div className="flex flex-col items-start gap-5">

          <div className="flex flex-row items-start gap-5">
          {/* Brand Logo - Floating, clean, no circle wrapper */}
          <BrandLogo />

          <div className="flex flex-wrap items-center justify-start gap-3 mt-8">
            <span className="bg-[#AACDDC]/18 text-[#3D3D4E] text-[10px] font-medium tracking-[0.1em] uppercase rounded-full px-4 py-1.5">
              Style Analysis
            </span>
            <span className="bg-[#AACDDC]/18 text-[#8A8A9A] text-[10px] font-medium tracking-[0.1em] uppercase rounded-full px-4 py-1.5">
              Step {step + 1} of 4
            </span>
          </div>
          </div>

          {/* Headline */}
          <div className="flex flex-col items-start gap-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-normal text-[#1A1A2E] font-playfair leading-tight max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-500">
              Discover Your<br />
              <span className="text-[#81A6C6]">Body Type.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-sm md:text-base text-[#8A8A9A] max-w-md leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
              Answer 4 quick questions and let ReFitly build your personal style profile.
            </p>
          </div>

        </div>
        {/* ── END HEADER ──────────────────────────────────────────────────────── */}

        {/* Progress Bar — unchanged */}
        <div className="w-full space-y-2">
          <div className="w-full h-[3px] bg-[#81A6C6]/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#81A6C6] to-[#AACDDC] transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-full"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] tracking-widest text-[#8A8A9A] uppercase">Question {step + 1} of 4</span>
            <span className="text-[10px] tracking-widest text-[#81A6C6] uppercase font-medium">{Math.round(currentProgress)}% complete</span>
          </div>
        </div>

        {/* Question Area — unchanged */}
        <div
          key={step}
          className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out fill-mode-both"
        >
          <div>
            <span className="text-[10px] tracking-widest text-[#8A8A9A] uppercase mb-4 block">Question {step + 1}</span>
            <h2 className="text-2xl md:text-3xl font-normal text-[#1A1A2E] font-playfair leading-snug max-w-2xl">
              {questions[step].question}
            </h2>
          </div>

          <div className="flex flex-col gap-3 max-w-2xl w-full">
            {questions[step].options.map((option) => {
              const alphabetMap = ["A", "B", "C", "D"];
              const letter = alphabetMap[questions[step].options.indexOf(option)];
              const isSelected = selectedOption === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  className={`
                    flex items-center gap-4 px-6 py-4 rounded-2xl w-full text-left transition-all duration-300 cursor-pointer group
                    ${isSelected
                      ? 'bg-[#AACDDC]/18 border-l-[3px] border-[#81A6C6] shadow-[0_4px_20px_rgba(170,205,220,0.22)]'
                      : 'bg-[#FAF6F1] hover:bg-[#EFE6D9] hover:translate-x-1 hover:shadow-[0_2px_16px_rgba(129,166,198,0.12)]'
                    }
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-medium transition-all duration-300
                    ${isSelected ? 'bg-[#81A6C6] text-white' : 'bg-[#81A6C6]/10 text-[#81A6C6] group-hover:bg-[#81A6C6]/20'}
                  `}>
                    {letter}
                  </div>
                  <span className={`
                    text-sm md:text-base font-inter transition-colors duration-300
                    ${isSelected ? 'text-[#1A1A2E] font-medium' : 'text-[#3D3D4E]'}
                  `}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Next Button — unchanged */}
          <div className="min-h-[60px] pb-10">
            {selectedOption && (
              <button
                disabled={isLoading}
                onClick={handleNext}
                className="group relative w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 bg-[#81A6C6] text-white rounded-full text-sm font-medium tracking-wide transition-all duration-400 ease-out hover:bg-[#6B90B0] hover:translate-x-1 hover:shadow-[0_8px_24px_rgba(129,166,198,0.35)] animate-in fade-in slide-in-from-bottom-4"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>{step === totalSteps - 1 ? "Reveal My Style →" : "Continue →"}</>
                )}
              </button>
            )}
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}} />
    </div>
  );
};

export default OnboardingQuiz;
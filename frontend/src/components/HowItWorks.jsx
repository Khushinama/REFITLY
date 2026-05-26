import { Camera, Upload, Brain, CheckCircle } from 'lucide-react';
import React from 'react';

function HowItWorks() {
  const steps = [
    {
      icon: Camera,
      title: 'Capture Your Body Shape',
      description: 'Take a simple full-body photo and upload it to our secure platform.',
      step: '01',
    },
    {
      icon: Upload,
      title: 'Upload Your Wardrobe',
      description: 'Add photos of your clothes. Our AI will catalog everything automatically.',
      step: '02',
    },
    {
      icon: Brain,
      title: 'AI Analyzes Everything',
      description: 'Our smart algorithm matches your body shape with your wardrobe and tracks rewear patterns.',
      step: '03',
    },
    {
      icon: CheckCircle,
      title: 'Get Daily Outfit Suggestions',
      description: 'Receive personalized outfit recommendations that look great and are safe to rewear.',
      step: '04',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-gradient-to-b from-beige-50 to-beige-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-dark mb-4">
            How It Works
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-primary-dark/70 max-w-2xl mx-auto px-4">
            Get started in just 4 simple steps. No fashion expertise required.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="bg-beige-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-beige-300 h-full">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary text-[#1e3a40] rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.step}
                  </div>

                  <div className="mt-4 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-primary-dark mb-3">
                    {step.title}
                  </h3>

                  <p className="text-primary-dark/70 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/30"></div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <button className="bg-primary text-[#1e3a40] px-8 py-4 rounded-full hover:bg-primary-hover transition-all transform hover:scale-105 font-bold text-lg shadow-lg">
            Start Your Free Trial Now
          </button>
          <p className="mt-4 text-primary-dark/60 text-sm">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;

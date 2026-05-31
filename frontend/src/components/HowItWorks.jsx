import { Camera, Upload, Brain, CheckCircle } from 'lucide-react';
import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

function HowItWorks() {

    const navigate = useNavigate()

  const steps = [
    {
      icon: Camera,
      title: 'Create Your Style Profile',
      description: 'Complete a quick onboarding quiz to build your personalized body-shape-aware style profile.',
      step: '01',
    },
    {
      icon: Upload,
      title: 'Organize Your Wardrobe',
      description: 'Add clothing items to your digital wardrobe and let ReFitly understand your fashion collection..',
      step: '02',
    },
    {
      icon: Brain,
      title: 'Get AI-Powered Styling',
      description: 'Receive personalized outfit combinations based on your body shape, wardrobe, season, occasion, and style preferences.',
      step: '03',
    },
    {
      icon: CheckCircle,
      title: 'Build Your Fashion History',
      description: 'Track worn outfits, manage rewear timing, and maintain a visual styling diary of your favorite looks.',
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
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.step}
                  </div>

                  <div className="mt-4 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-8 h-8 text-primary-dark" />
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
          <button onClick={() => navigate('/signup')} className="bg-primary text-white px-8 py-4 rounded-full hover:bg-primary-hover transition-all transform hover:scale-105 font-bold text-lg shadow-lg">
            Start Your Free Trial Now
          </button>
         
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;

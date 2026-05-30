import { Shirt, ArrowRight } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Hero() {

  const navigate = useNavigate();

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-beige-50 to-beige-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full">
              
              <span className="text-sm font-medium text-primary-dark">
                Body-Shape Adaptive AI Styling
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-dark leading-tight">
              Dress Smart.<br />
              Rewear Better.<br />
              <span className="text-primary-dark/70">Look Amazing.</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-dark/70 leading-relaxed">
              ReFitly analyzes your body shape, wardrobe, and rewear patterns to suggest perfect outfits. No more wardrobe confusion. No more repetition anxiety.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button onClick={() => navigate("/signup")} className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-full hover:bg-primary-hover transition-all transform hover:scale-105 flex items-center justify-center space-x-2 font-bold shadow-lg">
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </button>
             
            </div>

            {/* <div className="flex items-center space-x-8 pt-6">
              <div>
                <p className="text-3xl font-bold text-primary">50K+</p>
                <p className="text-sm text-primary/60">Active Users</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">10M+</p>
                <p className="text-sm text-primary/60">Outfits Created</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">4.9/5</p>
                <p className="text-sm text-primary/60">User Rating</p>
              </div>
            </div> */}
          </div>

          <div className="relative">
            <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-8 md:p-12">
              <div className="absolute -top-4 -right-4 bg-primary text-white px-6 py-3 rounded-full shadow-lg">
                <p className="text-sm font-bold">AI Powered</p>
              </div>

              <div className="bg-beige-50 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center justify-center mb-6">
                  <Shirt className="w-32 h-32 text-primary" />
                </div>
                <div className="space-y-4">
                  <div className="bg-beige-100 rounded-lg p-4">
                    <p className="text-sm text-primary-dark/60">Your Body Shape</p>
                    <p className="text-lg font-bold text-primary-dark">Inverted Triangle</p>
                  </div>
                  <div className="bg-beige-100 rounded-lg p-4">
                    <p className="text-sm text-primary-dark/60">Today's Suggestion</p>
                    <p className="text-lg font-bold text-primary-dark">Dark Top + Light Bottom</p>
                  </div>
                  <div className="bg-primary text-white rounded-lg p-4 text-center">
                    <p className="font-bold">Safe to Rewear: 3 Outfits</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;

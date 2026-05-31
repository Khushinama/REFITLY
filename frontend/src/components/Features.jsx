import { Scan, Shirt, Clock, Star } from 'lucide-react';
import React from 'react';

function Features() {
  const features = [
    {
      icon: Scan,
      title: 'Body Shape Style Analysis',
      description: 'Complete a quick style quiz and ReFitly identifies your body shape profile to provide personalized fashion guidance and outfit recommendations.',
      benefits: ['Quiz-based body shape detection', 'Personalized style profile', 'Shape-specific styling tips'],
      color: 'from-primary/20 to-primary/10',
    },
    {
      icon: Shirt,
      title: 'Smart Outfit Recommendations',
      description: 'Get AI-powered outfit suggestions created from your own wardrobe based on occasion, style preference, season, and color harmony.',
      benefits: ['Occasion-based outfit matching', 'Personalized outfit scoring', 'Color harmony recommendations'],
      color: 'from-beige-300 to-beige-200',
    },
    {
      icon: Star,
      title: 'Color harmony recommendations',
      description: "Build your digital wardrobe by organizing clothing items, categories, colors, and occasions for smarter outfit generation.",
      benefits: ['Wardrobe organization', 'Clothing categorization', 'Occassion-based filtering'],
      color: 'from-primary/15 to-beige-200',
    },
    {
      icon: Clock,
      title: 'Fashion History & Rewear Tracking',
      description: "Track outfits you've worn, visualize your styling history, and make smarter decisions about repeating looks.",
      benefits: ['Outfit history calendar', 'Rewear gap monitoring', 'Personal styling diary'],
      color: 'from-beige-400 to-beige-300',
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-beige-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-dark mb-4 px-2">
            Powerful Features for Smart Dressing
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-primary-dark/70 max-w-3xl mx-auto px-4">
            ReFitly combines AI, body shape science, and wardrobe analytics to transform how you dress every day.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-beige-200 rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300 border border-beige-300"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 shadow-sm`}>
                  <Icon className="w-8 h-8 text-primary-dark" />
                </div>

                <h3 className="text-2xl font-bold text-primary-dark mb-4">
                  {feature.title}
                </h3>

                <p className="text-primary-dark/70 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                <div className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-primary-dark/80">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-gradient-to-br from-primary/80 to-primary/60 rounded-3xl p-8 md:p-12 text-center shadow-lg">
          <h3 className="text-2xl md:text-3xl font-bold text-primary-dark mb-4">
            Works for Everyone, Everywhere
          </h3>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-primary-dark/90">
            <span className="text-sm md:text-base">Kids</span>
            <span className="text-beige-400">•</span>
            <span className="text-sm md:text-base">Teens</span>
            <span className="text-beige-400">•</span>
            <span className="text-sm md:text-base">College Students</span>
            <span className="text-beige-400">•</span>
            <span className="text-sm md:text-base">Working Professionals</span>
            <span className="text-beige-400">•</span>
            <span className="text-sm md:text-base">Seniors</span>
          </div>
          <p className="mt-4 text-primary-dark/80 max-w-2xl mx-auto font-medium">
            All ages. All genders. All body types. One smart solution.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Features;

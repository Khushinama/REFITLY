import { Scan, Shirt, Clock, Sparkles } from 'lucide-react';
import React from 'react';

function Features() {
  const features = [
    {
      icon: Scan,
      title: 'Body Shape Detection',
      description: 'Upload your photo and our AI identifies your body shape from 7 types including Rectangle, Triangle, Inverted Triangle, Hourglass, Pear, Oval, and Athletic.',
      benefits: ['Personalized style tips', 'Shape-specific outfit rules', 'Flattering silhouettes'],
      color: 'from-primary/20 to-primary/10',
    },
    {
      icon: Shirt,
      title: 'Body-Shape Based Styling',
      description: 'Get outfit suggestions tailored to your body shape. Dark bottoms for pear shapes, structured shoulders for rectangles, and more.',
      benefits: ['Custom color palettes', 'Pattern recommendations', 'Perfect fit guidance'],
      color: 'from-beige-300 to-beige-200',
    },
    {
      icon: Clock,
      title: 'Re-wear Gap Planner',
      description: 'Never worry about wearing the same outfit too soon. Our AI tracks when you last wore each item and suggests the perfect rewear timing.',
      benefits: ['Social media check', 'Weather-based timing', 'Event importance analysis'],
      color: 'from-primary/15 to-beige-200',
    },
    {
      icon: Sparkles,
      title: 'Auto Mix & Match',
      description: 'Upload your wardrobe and let AI create unlimited outfit combinations for every occasion from casual to formal.',
      benefits: ['Smart combinations', 'Occasion-based outfits', 'Budget-friendly styling'],
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

        <div className="mt-16 bg-gradient-to-r from-primary to-primary-hover rounded-3xl p-8 md:p-12 text-center shadow-lg">
          <h3 className="text-2xl md:text-3xl font-bold text-[#1e3a40] mb-4">
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
          <p className="mt-4 text-[#1e3a40]/80 max-w-2xl mx-auto font-medium">
            All ages. All genders. All body types. One smart solution.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Features;

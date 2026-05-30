import { useState } from 'react';
import { User, Calendar, TrendingUp, Play } from 'lucide-react';
import React from 'react';

function LiveDemo() {
  const [activeDemo, setActiveDemo] = useState('bodyShape');

  const bodyShapes = [
    'Rectangle',
    'Triangle',
    'Inverted Triangle',
    'Hourglass',
    'Pear',
    'Oval',
    'Athletic',
  ];

  const outfitSuggestions = [
    { name: 'Dark Top + Light Bottom', occasion: 'Office', rewearIn: '7 days' },
    { name: 'Vertical Stripes + Slim Jeans', occasion: 'Casual', rewearIn: '5 days' },
    { name: 'Structured Blazer + Dark Pants', occasion: 'Meeting', rewearIn: '10 days' },
  ];

  return (
    <section id="demo" className="py-16 md:py-24 bg-beige-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Play className="w-3 md:w-4 h-3 md:h-4 text-primary" />
            <span className="text-xs md:text-sm font-medium text-primary-dark">Interactive Demo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-dark mb-4">
            See ReFitly in Action
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-primary-dark/70 max-w-2xl mx-auto px-4">
            Experience how our AI analyzes and suggests outfits tailored to you.
          </p>
        </div>

        <div className="bg-beige-100 rounded-3xl p-4 md:p-8 lg:p-12 border-2 border-beige-300">
          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mb-8">
            <button
              onClick={() => setActiveDemo('bodyShape')}
              className={`px-4 md:px-6 py-2.5 md:py-3 rounded-full text-sm md:text-base font-medium transition-all flex items-center justify-center ${
                activeDemo === 'bodyShape'
                  ? 'bg-primary text-white'
                  : 'bg-beige-100 text-primary-dark hover:bg-beige-200'
              }`}
            >
              <User className="w-4 h-4 mr-2" />
              Body Shape
            </button>
            <button
              onClick={() => setActiveDemo('rewear')}
              className={`px-4 md:px-6 py-2.5 md:py-3 rounded-full text-sm md:text-base font-medium transition-all flex items-center justify-center ${
                activeDemo === 'rewear'
                  ? 'bg-primary text-white'
                  : 'bg-beige-100 text-primary-dark hover:bg-beige-200'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Rewear Planner
            </button>
            <button
              onClick={() => setActiveDemo('suggestions')}
              className={`px-4 md:px-6 py-2.5 md:py-3 rounded-full text-sm md:text-base font-medium transition-all flex items-center justify-center ${
                activeDemo === 'suggestions'
                  ? 'bg-primary text-white'
                  : 'bg-beige-100 text-primary-dark hover:bg-beige-200'
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Suggestions
            </button>
          </div>

          <div className="bg-beige-200 rounded-2xl p-4 md:p-8 min-h-[400px]">
            {activeDemo === 'bodyShape' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-primary-dark mb-6">
                  Your Body Shape: Inverted Triangle
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-primary-dark mb-4">All Body Shape Types:</h4>
                    <div className="space-y-2">
                      {bodyShapes.map((shape, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${
                            shape === 'Inverted Triangle'
                              ? 'bg-primary text-white font-bold'
                              : 'bg-beige-100 text-primary-dark/70'
                          }`}
                        >
                          {shape}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
                    <h4 className="font-bold text-primary-dark mb-4">Style Tips for You:</h4>
                    <ul className="space-y-3 text-primary-dark/80">
                      <li className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span>Wear dark solid colors on top</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span>Choose lighter colors for bottom</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span>Avoid structured shoulders</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span>Try V-neck and scoop necks</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span>Flared or bootcut pants work great</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeDemo === 'rewear' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-primary mb-6">
                  Rewear Timeline Analysis
                </h3>
                <div className="space-y-4">
                  {[
                    { item: 'Blue Denim Jacket', lastWorn: '3 days ago', status: 'Wait 6 more days', color: 'red' },
                    { item: 'White Oxford Shirt', lastWorn: '12 days ago', status: 'Safe to rewear', color: 'green' },
                    { item: 'Black Leather Jacket', lastWorn: '8 days ago', status: 'Wait 1 more day', color: 'yellow' },
                    { item: 'Grey Sweater', lastWorn: '15 days ago', status: 'Safe to rewear', color: 'green' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-beige-100 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-primary-dark">{item.item}</p>
                        <p className="text-sm text-primary-dark/60">Last worn: {item.lastWorn}</p>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          item.color === 'green'
                            ? 'bg-green-100 text-green-800'
                            : item.color === 'yellow'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeDemo === 'suggestions' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-primary mb-6">
                  Today's Outfit Suggestions
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {outfitSuggestions.map((outfit, idx) => (
                    <div key={idx} className="bg-beige-100 rounded-xl p-6 border-2 border-beige-300 hover:border-primary transition-colors">
                      <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg mb-4 flex items-center justify-center">
                        <User className="w-16 h-16 text-primary" />
                      </div>
                      <h4 className="font-bold text-primary-dark mb-2">{outfit.name}</h4>
                      <p className="text-sm text-primary-dark/60 mb-2">For: {outfit.occasion}</p>
                      <p className="text-sm text-primary-dark/80">
                        Can rewear in: <span className="font-bold">{outfit.rewearIn}</span>
                      </p>
                      <button className="mt-4 w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-hover font-bold transition-all">
                        Try This Outfit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LiveDemo;

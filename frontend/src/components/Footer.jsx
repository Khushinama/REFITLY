import { Mail, Twitter, Instagram, Facebook, Linkedin } from 'lucide-react';
import React from 'react';
import BrandLogo from './common/BrandLogo';

function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: ['Features', 'How It Works', 'Pricing', 'Demo', 'FAQ'],
    Company: ['About Us', 'Careers', 'Blog', 'Press', 'Partners'],
    Support: ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service', 'Cookie Policy'],
    Resources: ['Style Guide', 'Body Shape Guide', 'Fashion Tips', 'Community', 'Mobile App'],
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gradient-to-b from-beige-50 to-beige-200 border-t border-beige-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <div className="flex items-center mb-4">
              <BrandLogo variant="navbar" />
            </div>
            <p className="text-primary-dark/70 mb-6 max-w-sm">
              Your AI-powered wardrobe assistant that helps you dress better, rewear smarter, and look amazing every day.
            </p>
            <div className="flex items-center space-x-2 mb-4">
              <Mail className="w-5 h-5 text-primary" />
              <a href="mailto:hello@ReFitly.com" className="text-primary-dark hover:text-primary transition-colors">
                hello@ReFitly.com
              </a>
            </div>
            <div className="flex space-x-4">
              {socialLinks.map((social, idx) => {
                const Icon = social.icon;
                return (
                  <a
                    key={idx}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark hover:bg-primary-hover hover:text-white transition-all"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-bold text-primary-dark mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link, idx) => (
                  <li key={idx}>
                    <a href="#" className="text-primary-dark/70 hover:text-primary-dark transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-beige-300 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-primary-dark/60 text-sm text-center md:text-left">
              © {currentYear} ReFitly. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a href="#" className="text-primary-dark/70 hover:text-primary-dark transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-primary-dark/70 hover:text-primary-dark transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-primary-dark/70 hover:text-primary-dark transition-colors">
                Cookie Settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

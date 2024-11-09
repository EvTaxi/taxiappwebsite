'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative pt-16 pb-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800" />
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 flex flex-col items-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Maximize Your Ride-Share Revenue.
            <br />
            <span className="text-yellow-400"> Keep 100% of Your Fares!</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Stop letting ride-sharing platforms take a slice of your hard-earned money. Get your own personalized booking system with QR codes to take back control, increase your profits, and provide a seamless experience for your customers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center gap-2 justify-center">
              Ready to Boost Your Business?
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-white/10 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-colors">
              Watch Demo
            </button>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { number: '100%', label: 'Keep every dollar.' },
              { number: '0%', label: 'Commission Fees' },
              { number: '24/7', label: 'Booking System' },
              { number: 'Free', label: 'QR Code Signs' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-400">{stat.number}</div>
                <div className="text-sm text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 w-full">
        <svg viewBox="0 0 1440 200" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,128L48,117.3C96,107,192,85,288,90.7C384,96,480,128,576,133.3C672,139,768,117,864,112C960,107,1056,117,1152,122.7C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
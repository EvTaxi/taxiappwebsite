'use client';

import { motion } from 'framer-motion';
import { QrCode, Calendar, Wallet, Users, Smartphone, Settings } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: QrCode,
      title: "Instant QR Code Booking",
      description: "Customers can scan QR codes on your vehicle to book rides instantly - no app download required."
    },
    {
      icon: Smartphone,
      title: "NFC Tap-to-Book",
      description: "NFC cards in your vehicle allow customers to book with a simple tap of their phone."
    },
    {
      icon: Calendar,
      title: "Future Bookings",
      description: "Accept advance reservations and build a reliable schedule of regular customers."
    },
    {
      icon: Wallet,
      title: "Keep 100% of Fares",
      description: "No commission fees. Every dollar your customers pay goes directly to you."
    },
    {
      icon: Users,
      title: "Build Your Customer Base",
      description: "Create lasting relationships with customers who can book you directly."
    },
    {
      icon: Settings,
      title: "Complete Control",
      description: "Set your own rates, hours, and service area. You're in complete control of your business."
    }
  ];

  return (
    <section className="py-20 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600">
            Our complete solution gives you the tools to run your own ride-share business completely independently
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="relative p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does the QR code booking system work?",
      answer: "We provide you with custom magnitic or viynl QR code signs to place on your vehicle. When customers scan these codes with their phone camera, they're taken directly to your booking page where they can request a ride immediately or schedule for later - no app download required."
    },
    {
      question: "Do I need to pay any commission fees?",
      answer: "No! Unlike ride-sharing companies that take 50-75% of your fares, we charge zero commission. You keep 100% of what your customers pay. We charge a one-time payment to create your app and a fixed monthly payment to cover server costs and to provide you with support."
    },
    {
      question: "What's included in the setup fee?",
      answer: "Your setup fee covers custom QR code signs, Taxi Light, NFC cards, initial system configuration, and personal onboarding support to get you started. We'll help you set up your rates, service area, and booking preferences."
    },
    {
      question: "Can customers schedule future rides?",
      answer: "Yes! Customers can book rides in advance with you, helping you build a reliable schedule of regular customers. Perfect for airport runs, regular commuters, or big events."
    },
    {
      question: "How do I receive payments from customers?",
      answer: "You can accept cash payments or use servies like cash app or venmo etc. Higher Tier plans we provivde support to set up in app payment processors to accept credit cards and digital payments along with custom tip pages."
    },
    {
      question: "What kind of support do you provide?",
      answer: "We provide technical support for your booking system, help issues ou may encounter, and guidance on growing your business. Higher tier plans include priority support and business consulting."
    },
	{
      question: "Can I still do Uber and Lyft?",
      answer: "Absolutely. Turn one-time rides into loyal, direct-booking clients. The EV Taxi platform works alongside your existing services, helping you:
      Convert satisfied passengers into regular customers
      Build your own client base gradually
      Earn full fares from repeat bookings
      Create independence on your own schedule
      Think of Uber and Lyft as your marketing channel. Provide great service, share your personal booking options, and watch your direct business grow."
    }
  ];

  return (
    <section className="py-20 bg-white" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about our service
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                className="w-full px-6 py-4 flex items-center justify-between text-left bg-white hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {openIndex === index ? (
                  <Minus className="w-5 h-5 text-gray-500" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-500" />
                )}
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-4 bg-gray-50 text-gray-600">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
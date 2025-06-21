import React from "react";
import { motion } from "framer-motion";

const FeatureCard = () => {
  return (
    <>
      <section className="bg-white py-10"> {/* reduced vertical padding */}
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-10" // reduced bottom margin
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Our Core Features
            </h2>
            <p className="text-lg text-gray-600">
              Discover what makes our platform unique and useful.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> {/* reduced gap */}
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`rounded-2xl transition-all duration-300 overflow-hidden group shadow-sm hover:shadow-md ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
                }`}
              >
                <div className="p-6 text-center text-4xl bg-gray-200">
                  {feature.icon}
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FeatureCard;

// Updated features list with subtle icon meanings
const features = [
  {
    title: "A Vibrant Community",
    description: "Ask questions, share knowledge, and grow together.",
    icon: "💬",
  },
  {
    title: "Unique Coin System",
    description: "Earn Skill Coins by helping others and teaching.",
    icon: "🪙",
  },
  {
    title: "Gamified Learning",
    description: "Track your streaks, badges, and progress stats.",
    icon: "🎮",
  },
  {
    title: "Skill Marketplace",
    description: "Buy courses or sell your expertise to others.",
    icon: "🛒",
  }
];

import React from "react";
import { motion } from "framer-motion";

const Works = () => {
  return (
    <>
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Your journey to skill growth in four easy steps.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {[
              {
                step: "1",
                title: "Create Profile",
                description: "Start your journey and get a sign-up bonus.",
                icon: "📝", // Represents signing up / creating
              },
              {
                step: "2",
                title: "Buy and Sell Courses",
                description: "Explore, purchase, or share courses.",
                icon: "📚", // Courses / Learning
              },
              {
                step: "3",
                title: "Exchange",
                description: "Answer doubts and receive SkillCoins.",
                icon: "💬", // Communication / Helping
              },
              {
                step: "4",
                title: "Be Consistent",
                description: "Your progress is tracked.",
                icon: "📈", // Growth / Progress
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow bg-gray-200 text-black">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Works;

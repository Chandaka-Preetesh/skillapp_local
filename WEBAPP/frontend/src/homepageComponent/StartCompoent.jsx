import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/ui/Navbar";
import { Button } from "@/components/ui/button";

const StartComponent = () => {
  const navigate = useNavigate();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  function goToLoginPage() {
    navigate("/login");
  }

  return (
    <>
      <div className=" bg-white text-black">
        <Navbar />

        {/* Hero Section */}
        <div className="relative overflow-hidden py-20 sm:py-24 bg-gray-50"> {/* reduced from py-32 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="text-center max-w-4xl mx-auto"
              initial={fadeIn.initial}
              animate={fadeIn.animate}
              transition={fadeIn.transition}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                Share. Learn. Gain.
              </h1>
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mt-4">
                Earn Skill Coins.
              </h2>
              <p className="mt-6 text-base sm:text-lg text-gray-600">
                Join our platform to trade skills, resolve doubts, and grow with the community.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-4 sm:gap-6">
                <Button
                  onClick={goToLoginPage}
                  className="px-8 py-4 text-lg font-semibold bg-black hover:bg-gray-800 text-white rounded-xl transform hover:scale-105 transition-all shadow"
                >
                  Get Started Now
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate("/explore")}
                  className="px-8 py-4 text-lg font-semibold border-2 border-black text-black hover:bg-gray-100 rounded-xl transform hover:scale-105 transition-all"
                >
                  Learn More
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StartComponent;

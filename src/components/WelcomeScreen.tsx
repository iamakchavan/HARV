import { motion } from "framer-motion";
import React from "react";
import { AuroraBackground } from "./ui/aurora-background";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  return (
    <AuroraBackground className="rounded-lg min-h-[600px]">
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col items-center justify-center h-full px-4 z-10"
      >
        <div className="text-7xl dark:text-white text-center font-instrument font-normal mb-20">
          Welcome
        </div>
        <button
          onClick={onGetStarted}
          className="px-8 py-3 text-white rounded-full 
            transition-all duration-200 font-instrument text-lg
            relative overflow-hidden group hover:scale-105 active:scale-95
            bg-gray-600/20 hover:bg-gray-600/30 backdrop-blur-sm"
        >
          <span className="relative">get started →</span>
        </button>
      </motion.div>
    </AuroraBackground>
  );
}; 
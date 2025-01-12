import { motion } from "framer-motion";
import React from "react";
import { AuroraBackground } from "./ui/aurora-background";
import { Sparkles, Image, Target, Brain } from "lucide-react";

interface FeaturesPageProps {
  onContinue: () => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onContinue }) => {
  const features = [
    {
      title: "Smart Summarization",
      description: "Get instant, accurate summaries of any webpage with a single click.",
      icon: <Sparkles className="w-5 h-5 text-white/80" />
    },
    {
      title: "Image Analysis",
      description: "Upload and analyze images with advanced AI capabilities.",
      icon: <Image className="w-5 h-5 text-white/80" />
    },
    {
      title: "Custom Search Scopes",
      description: "Focus your search on specific parts of the webpage for more precise results.",
      icon: <Target className="w-5 h-5 text-white/80" />
    },
    {
      title: "Context Awareness",
      description: "AI understands the webpage context to provide more relevant and accurate responses.",
      icon: <Brain className="w-5 h-5 text-white/80" />
    }
  ];

  return (
    <AuroraBackground className="rounded-lg min-h-[600px] relative">
      <div className="absolute inset-0 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative flex flex-col items-center justify-start min-h-[600px] px-8 pt-12 pb-8 z-10"
        >
          <h1 className="text-5xl dark:text-white text-center font-instrument font-normal mb-12">
            Features
          </h1>
          <div className="grid gap-4 w-full max-w-md mb-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.5 + index * 0.1,
                  duration: 0.5,
                }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 hover:bg-white/15 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-black/40 p-2 rounded-xl">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-instrument text-white font-normal">{feature.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.button
            onClick={onContinue}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="px-8 py-3 text-white rounded-full 
              transition-all duration-200 font-instrument text-lg
              relative overflow-hidden group hover:scale-105 active:scale-95
              bg-gray-600/20 hover:bg-gray-600/30 backdrop-blur-sm"
          >
            <span className="relative">continue →</span>
          </motion.button>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}; 
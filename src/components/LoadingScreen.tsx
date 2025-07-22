
import React, { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "Assessing form submissions",
    "Generating your unique curve", 
    "Compiling custom insights"
  ];

  useEffect(() => {
    // Progress animation from 0 to 100 over 2 seconds
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Complete after progress reaches 100%
          setTimeout(onComplete, 100);
          return 100;
        }
        return prev + 2; // Increment by 2 every 40ms (2000ms / 50 steps)
      });
    }, 40);

    // Message cycling every ~650ms
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => {
        if (prev < messages.length - 1) {
          return prev + 1;
        }
        clearInterval(messageInterval);
        return prev;
      });
    }, 650);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [onComplete]);

  return (
    <div className="animate-fade-in text-center max-w-md mx-auto">
      <div className="w-20 h-20 mx-auto mb-8 bg-rhythm-accent1 rounded-full flex items-center justify-center animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      </div>
      
      <h2 className="font-serif text-2xl font-semibold text-gray-800 mb-2">
        Creating Your Energy Map
      </h2>
      
      <p className="text-rhythm-text mb-8 animate-fade-in" key={messageIndex}>
        {messages[messageIndex]}
      </p>
      
      <div className="space-y-2">
        <Progress 
          value={progress} 
          className="w-full h-3 bg-rhythm-purple"
        />
        <div className="text-sm text-rhythm-text">
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

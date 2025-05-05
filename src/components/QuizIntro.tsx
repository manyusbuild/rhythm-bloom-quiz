
import React from 'react';
import { Button } from "@/components/ui/button";

interface QuizIntroProps {
  onStart: () => void;
}

const QuizIntro: React.FC<QuizIntroProps> = ({ onStart }) => {
  return (
    <div className="animate-fade-in text-center max-w-xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4 mt-10">
        Discover Your Rhythm
      </h1>
      <p className="text-rhythm-text text-lg mb-8">
        Map your monthly energy flow based on your unique menstrual cycle. 
        Answer a few questions and get a personalized energy curve to help you understand 
        and plan around your natural rhythm.
      </p>
      
      <div className="w-48 h-48 mx-auto mb-6 flex items-center justify-center">
        <div className="w-40 h-40 bg-rhythm-pink rounded-full flex items-center justify-center animate-pulse">
          <div className="w-28 h-28 bg-rhythm-purple rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-rhythm-accent1 rounded-full"></div>
          </div>
        </div>
      </div>
      
      <p className="text-rhythm-text mb-8 text-md">
        5 simple questions • Takes 2 minutes • Get your personalized cycle map
      </p>
      
      <Button 
        onClick={onStart}
        className="bg-rhythm-accent1 hover:bg-rhythm-accent2 text-white py-2 px-8 rounded-full text-lg"
      >
        Begin Mapping
      </Button>
    </div>
  );
};

export default QuizIntro;

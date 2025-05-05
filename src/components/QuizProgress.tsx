
import React from 'react';

interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
}

const QuizProgress: React.FC<QuizProgressProps> = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="mb-8">
      <div className="flex justify-between text-xs text-rhythm-text mb-2">
        <span>Question {currentStep} of {totalSteps}</span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
      <div className="w-full h-2 bg-rhythm-softGray rounded-full">
        <div 
          className="h-full bg-rhythm-accent1 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default QuizProgress;

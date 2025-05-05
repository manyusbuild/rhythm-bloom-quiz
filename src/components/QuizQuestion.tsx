
import React from 'react';
import { Button } from "@/components/ui/button";
import { QuizQuestion as QuestionType } from "@/utils/quizData";
import QuizProgress from './QuizProgress';

interface QuizQuestionProps {
  question: QuestionType;
  currentStep: number;
  totalSteps: number;
  selectedAnswer: string | null;
  onSelectAnswer: (answerId: string, value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ 
  question, 
  currentStep, 
  totalSteps,
  selectedAnswer,
  onSelectAnswer,
  onNext,
  onPrevious
}) => {
  return (
    <div className="animate-fade-in w-full max-w-full">
      <QuizProgress currentStep={currentStep} totalSteps={totalSteps} />
      
      <h2 className="text-xl md:text-2xl font-medium text-gray-800 mb-6">
        {question.question}
      </h2>
      
      <div className="space-y-3 mb-8">
        {question.options.map((option) => (
          <div 
            key={option.id}
            className={`option-card transition-colors p-3 border rounded-lg cursor-pointer 
              ${selectedAnswer === option.id ? 'border-rhythm-accent1 bg-pink-50' : 'border-gray-200 hover:border-gray-300'}`}
            onClick={() => onSelectAnswer(option.id, option.value)}
          >
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full mr-3 border-2 flex items-center justify-center
                ${selectedAnswer === option.id ? 'border-rhythm-accent1 bg-white' : 'border-gray-300'}`}>
                {selectedAnswer === option.id && (
                  <div className="w-3 h-3 rounded-full bg-rhythm-accent1"></div>
                )}
              </div>
              <span className="text-gray-800">{option.text}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentStep === 1}
          className="px-4 md:px-6"
        >
          Back
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!selectedAnswer}
          className="bg-rhythm-accent1 hover:bg-rhythm-accent2 text-white px-6 md:px-8"
        >
          {currentStep === totalSteps ? "See Results" : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default QuizQuestion;

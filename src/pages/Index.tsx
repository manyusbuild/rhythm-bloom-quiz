import React, { useState } from 'react';
import QuizIntro from "@/components/QuizIntro";
import QuizQuestion from "@/components/QuizQuestion";
import EmailCapture from "@/components/EmailCapture";
import ResultsScreen from "@/components/ResultsScreen";
import { quizQuestions, defaultResults, QuizResults } from "@/utils/quizData";
import { toast } from "sonner";

// Define our quiz flow stages
type QuizStage = 'intro' | 'questions' | 'email' | 'results';
const Index = () => {
  const [stage, setStage] = useState<QuizStage>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, {
    id: string;
    value: string;
  }>>({});
  const [results, setResults] = useState<QuizResults>(defaultResults);

  // Start the quiz
  const handleStart = () => {
    setStage('questions');
  };

  // Handle answer selection
  const handleSelectAnswer = (answerId: string, value: string) => {
    const questionId = quizQuestions[currentQuestionIndex].id;
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        id: answerId,
        value
      }
    }));
  };

  // Navigate to next question or stage
  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Process answers into results
      const cycleLength = answers[1]?.value || "";
      const periodLength = answers[2]?.value || "";
      const peakEnergy = answers[3]?.value || "";
      const lowestEnergy = answers[4]?.value || "";
      const condition = answers[5]?.value || "";
      setResults({
        cycleLength,
        periodLength,
        peakEnergy,
        lowestEnergy,
        condition
      });

      // Move to email capture
      setStage('email');
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Handle email submission
  const handleEmailSubmit = (email: string) => {
    // Update results with email
    setResults(prev => ({
      ...prev,
      email
    }));
    toast.success("Your personalized energy map has been generated!");
    setStage('results');
  };

  // Skip email capture
  const handleSkipEmail = () => {
    setStage('results');
  };

  // Reset the quiz
  const handleReset = () => {
    setStage('intro');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResults(defaultResults);
  };

  // Determine which content to render based on current stage
  const renderContent = () => {
    switch (stage) {
      case 'intro':
        return <QuizIntro onStart={handleStart} />;
      case 'questions':
        const currentQuestion = quizQuestions[currentQuestionIndex];
        const selectedAnswer = answers[currentQuestion.id]?.id || null;
        return <QuizQuestion question={currentQuestion} currentStep={currentQuestionIndex + 1} totalSteps={quizQuestions.length} selectedAnswer={selectedAnswer} onSelectAnswer={handleSelectAnswer} onNext={handleNext} onPrevious={handlePrevious} />;
      case 'email':
        return <EmailCapture onSubmit={handleEmailSubmit} onSkip={handleSkipEmail} results={results} />;
      case 'results':
        return <ResultsScreen results={results} onReset={handleReset} />;
      default:
        return <QuizIntro onStart={handleStart} />;
    }
  };
  return <div className="min-h-screen rhythm-gradient-bg pt-6 pb-12">
      <div className="container">
        <header className="text-center mb-6">
          <h1 className="font-serif font-normal text-2xl text-zinc-800">body rhythms</h1>
          
        </header>
        
        <main className="quiz-container">
          <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
            {renderContent()}
          </div>
        </main>
        
        <footer className="text-center mt-8 text-rhythm-text text-sm">
          <p>© 2025 BodyRhythms • Privacy-focused • Created with care</p>
        </footer>
      </div>
    </div>;
};
export default Index;
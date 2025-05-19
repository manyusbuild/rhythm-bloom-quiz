
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { storeSubmission } from "@/services/githubStorage";
import { QuizResults } from "@/utils/quizData";

interface EmailCaptureProps {
  onSubmit: (email: string) => void;
  onSkip: () => void;
  results: QuizResults;
}

const EmailCapture: React.FC<EmailCaptureProps> = ({ onSubmit, onSkip, results }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@') || !email.includes('.')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    // Store submission in GitHub
    try {
      const submission = {
        email,
        quizResults: results,
        timestamp: new Date().toISOString()
      };
      
      const success = await storeSubmission(submission, {
        owner: 'ManyusBuild',
        repo: 'rhythm-bloom-submissions'
        // No token passed from component - handled by the service
      });
      
      if (success) {
        toast.success("Your personalized energy map has been saved!");
      } else {
        toast.error("There was an issue saving your data. We'll continue anyway.");
        console.error("Failed to store submission");
      }
    } catch (error) {
      console.error("Error storing submission:", error);
      toast.error("There was an error, but we'll continue anyway");
    }
    
    // Continue with the quiz flow
    onSubmit(email);
    setIsSubmitting(false);
  };

  return (
    <div className="animate-fade-in text-center max-w-md mx-auto">
      <div className="w-20 h-20 mx-auto mb-6 bg-rhythm-accent1 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      </div>
      
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        Your rhythm map is ready!
      </h2>
      
      <p className="text-rhythm-text mb-6">
        Enter your email to receive your personalized energy curve and additional insights to help you plan around your natural rhythm.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="py-6 px-4 rounded-xl border-rhythm-purple focus:border-rhythm-accent1"
          required
        />
        
        <Button
          type="submit"
          className="w-full bg-rhythm-accent1 hover:bg-rhythm-accent2 text-white py-6 rounded-xl"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send My Energy Map"}
        </Button>
        
        <Button
          type="button"
          variant="link"
          onClick={onSkip}
          className="text-rhythm-text hover:text-rhythm-accent2"
        >
          Skip for now
        </Button>
      </form>
    </div>
  );
};

export default EmailCapture;

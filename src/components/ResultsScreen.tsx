
import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QuizResults } from "@/utils/quizData";
import { ArrowRight } from "lucide-react";
import EnergyGraphPoints from "@/components/EnergyGraphPoints";

interface ResultsScreenProps {
  results: QuizResults;
  onReset: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ results, onReset }) => {
  return (
    <div className="animate-fade-in flex flex-col gap-8">
      {/* Header section */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
          Your Energy Rhythm Map
        </h2>
        <p className="text-rhythm-text max-w-2xl mx-auto">
          Based on your responses, we've created a personalized map of how your energy may flow throughout your cycle
        </p>
      </div>
      
      {/* Graph container */}
      <div className="relative bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <div className="aspect-[4/3] w-full bg-gray-50 rounded">
          <div className="h-full w-full p-2">
            <EnergyGraphPoints results={results} />
          </div>
        </div>
        
        {/* Graph legend */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rhythm-accent1"></div>
            <span>Energy level</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-400"></div>
            <span>Peak days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>Low energy</span>
          </div>
        </div>
      </div>
      
      {/* Form summary recap */}
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Your Cycle Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Cycle Length</p>
            <p className="font-medium">{results.cycleLength || "Not specified"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Period Duration</p>
            <p className="font-medium">{results.periodLength || "Not specified"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Peak Energy Phase</p>
            <p className="font-medium">{results.peakEnergy || "Not specified"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Low Energy Phase</p>
            <p className="font-medium">{results.lowestEnergy || "Not specified"}</p>
          </div>
          {results.condition && results.condition !== "none" && (
            <div className="col-span-full space-y-1">
              <p className="text-sm text-gray-500">Health Conditions</p>
              <p className="font-medium">{results.condition}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Text-based insights */}
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Energy Rhythm Insights</h3>
        <div className="space-y-4 text-rhythm-text">
          <p>
            Your energy rhythm has unique patterns that can help you plan activities, manage energy levels, and practice self-care throughout your cycle.
          </p>
          <p>
            Pay special attention to your energy peaks around {results.peakEnergy === "afterPeriod" ? "the follicular phase" : 
              results.peakEnergy === "ovulation" ? "ovulation" : "middle of your cycle"} for high-intensity activities.
          </p>
          <p>
            During your low energy days, typically {results.lowestEnergy === "prePeriod" ? "before your period" : 
              results.lowestEnergy === "duringPeriod" ? "during your period" : 
              results.lowestEnergy === "postOvulation" ? "after ovulation" : "at various points in your cycle"}, 
            prioritize rest and gentle movement.
          </p>
        </div>
      </div>
      
      {/* CTA Section with avatar */}
      <div className="bg-gradient-to-r from-rhythm-accent2/10 to-purple-200/20 p-6 rounded-lg">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-white">
            <AvatarImage src="/placeholder.svg" alt="Coach" />
            <AvatarFallback>RB</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-medium">Want to learn more about your cycle?</h3>
            <p className="text-rhythm-text mt-1">Get personalized insights and strategies tailored to your cycle pattern.</p>
          </div>
          <Button className="mt-4 md:mt-0 bg-rhythm-accent1 hover:bg-rhythm-accent2 text-white">
            Schedule a consultation <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
        <Button
          onClick={onReset}
          variant="outline"
          className="border-rhythm-accent1 text-rhythm-accent1 hover:bg-rhythm-accent1/10"
        >
          Start Over
        </Button>
        
        <div className="flex gap-4 text-gray-500 text-sm">
          <a href="#" className="hover:text-rhythm-accent1">Email</a>
          <a href="#" className="hover:text-rhythm-accent1">Instagram</a>
          <a href="#" className="hover:text-rhythm-accent1">Twitter</a>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;


import React, { useState, useEffect } from 'react';
import { getLocalSubmissions, Submission } from '@/services/githubStorage';
import { Button } from '@/components/ui/button';

const SubmissionsViewer: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load submissions when opened
  useEffect(() => {
    if (isOpen) {
      const localSubmissions = getLocalSubmissions();
      setSubmissions(localSubmissions);
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="bg-white shadow-lg"
        >
          View Submissions ({localStorage.getItem('submissions') ? 
            JSON.parse(localStorage.getItem('submissions') || '[]').length : 0})
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Stored Submissions</h2>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Close</Button>
        </div>
        
        <div className="p-4">
          {submissions.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No submissions yet</p>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{submission.email}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(submission.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 bg-gray-50 p-2 rounded text-sm">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(submission.quizResults, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionsViewer;

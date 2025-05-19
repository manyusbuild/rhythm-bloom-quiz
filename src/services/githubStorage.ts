
/**
 * GitHub-based storage service
 * Stores form submissions in a GitHub repository as issues or JSON file
 */

interface GitHubStorageOptions {
  owner: string;
  repo: string;
  token?: string;
}

export interface Submission {
  id?: string;
  email: string;
  quizResults: Record<string, any>;
  timestamp: string;
}

const defaultOptions: GitHubStorageOptions = {
  owner: 'ManyusBuild', // GitHub username
  repo: 'rhythm-bloom-submissions', // Repository for submissions
};

// Generate a unique ID for submissions
const generateId = () => {
  return 'sub_' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const storeSubmission = async (
  submission: Submission,
  options: GitHubStorageOptions = defaultOptions
): Promise<boolean> => {
  try {
    // Add ID to submission if not present
    const submissionWithId: Submission = {
      ...submission,
      id: submission.id || generateId()
    };

    console.log(`Attempting to store submission for ${submissionWithId.email}`);

    // In production, use API gateway to trigger the GitHub workflow instead of direct API calls
    // This way we don't expose the token in client-side code
    if (import.meta.env.PROD) {
      console.log("Production mode detected, using API gateway");
      
      try {
        // This uses an API gateway or serverless function endpoint that will handle the GitHub API call
        // with the token securely on the server side
        const response = await fetch('/api/store-submission', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            submission: submissionWithId
          })
        });
        
        if (!response.ok) {
          console.error(`API gateway error (${response.status}): ${await response.text()}`);
          // Fall back to local storage
          storeLocalSubmission(submissionWithId);
          return false;
        }

        console.log('Successfully stored submission via API gateway');
        return true;
      } catch (error) {
        console.error('Error using API gateway:', error);
        storeLocalSubmission(submissionWithId);
        return false;
      }
    }

    // In development, store locally (no need to use GitHub API in dev mode)
    console.log("Development mode detected, using local storage only");
    storeLocalSubmission(submissionWithId);
    return true;
    
  } catch (error) {
    console.error('Error storing submission:', error);
    // Always fallback to local storage on error
    try {
      storeLocalSubmission(submission);
      return true;
    } catch (e) {
      console.error('Failed to store submission locally:', e);
      return false;
    }
  }
};

// Helper function to store submission in localStorage
const storeLocalSubmission = (submission: Submission): void => {
  try {
    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    submissions.push(submission);
    localStorage.setItem('submissions', JSON.stringify(submissions));
    console.log('Submission stored locally:', submission);
  } catch (error) {
    console.error('Error storing submission locally:', error);
  }
};

// For development/demo purposes - retrieve local submissions
export const getLocalSubmissions = (): Submission[] => {
  try {
    return JSON.parse(localStorage.getItem('submissions') || '[]');
  } catch (error) {
    console.error('Error getting local submissions:', error);
    return [];
  }
};


/**
 * GitHub-based storage service
 * Stores form submissions in a GitHub repository as issues or JSON file
 */

interface GitHubStorageOptions {
  owner: string;
  repo: string;
  appId?: number;
  installationId?: number;
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
  appId: 1294071, // Your GitHub App ID
  installationId: 67355545, // Your GitHub App Installation ID
};

// Generate a unique ID for submissions
const generateId = () => {
  return 'sub_' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Function to trigger GitHub repository_dispatch event
const triggerRepositoryDispatch = async (
  submission: Submission,
  options: GitHubStorageOptions
): Promise<boolean> => {
  try {
    // In production, we use a proxy endpoint to trigger the GitHub workflow
    // This endpoint will handle GitHub App authentication server-side
    const apiUrl = 'https://ap-rhythm-bloom.netlify.app/.netlify/functions/submit';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        submission,
        repository: {
          owner: options.owner,
          repo: options.repo,
          appId: options.appId,
          installationId: options.installationId
        }
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${errorText}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error triggering repository_dispatch:', error);
    return false;
  }
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

    // In production environment, use GitHub repository_dispatch
    if (import.meta.env.PROD) {
      console.log("Production mode detected, using GitHub App integration");
      
      try {
        const success = await triggerRepositoryDispatch(submissionWithId, options);
        
        if (!success) {
          console.error('Failed to trigger GitHub repository_dispatch');
          // Fall back to local storage
          storeLocalSubmission(submissionWithId);
          return false;
        }

        console.log('Successfully triggered GitHub repository_dispatch');
        return true;
      } catch (error) {
        console.error('Error using GitHub App integration:', error);
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

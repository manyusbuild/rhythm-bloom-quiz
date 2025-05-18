
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

    // In production, we trigger the GitHub workflow to store in JSON file
    if (import.meta.env.PROD) {
      if (options.token) {
        // Call GitHub Action workflow dispatch to update JSON file
        try {
          const response = await fetch(
            `https://api.github.com/repos/${options.owner}/${options.repo}/dispatches`,
            {
              method: 'POST',
              headers: {
                'Authorization': `token ${options.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                event_type: 'form_submission',
                client_payload: {
                  submission: submissionWithId
                }
              })
            }
          );

          if (!response.ok) {
            console.error('Failed to trigger workflow:', await response.text());
            // Fall back to local storage
            storeLocalSubmission(submissionWithId);
            return true;
          }

          console.log('Successfully triggered GitHub workflow for submission storage');
          // Also store locally for immediate access
          storeLocalSubmission(submissionWithId);
          return true;
        } catch (error) {
          console.error('Error triggering GitHub workflow:', error);
          storeLocalSubmission(submissionWithId);
          return true;
        }
      } else {
        // No token available, use localStorage
        storeLocalSubmission(submissionWithId);
        return true;
      }
    }

    // In development, store locally and optionally use GitHub Issues API if token is available
    if (options.token) {
      try {
        const response = await fetch(`https://api.github.com/repos/${options.owner}/${options.repo}/issues`, {
          method: 'POST',
          headers: {
            'Authorization': `token ${options.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: `Quiz Submission from ${submissionWithId.email}`,
            body: `
# Quiz Submission

## User
Email: ${submissionWithId.email}
ID: ${submissionWithId.id}

## Results
\`\`\`json
${JSON.stringify(submissionWithId.quizResults, null, 2)}
\`\`\`

Submitted at: ${submissionWithId.timestamp}
            `,
            labels: ['quiz-submission']
          })
        });

        if (!response.ok) {
          console.error('Failed to store submission as issue:', await response.text());
        } else {
          console.log('Stored submission as GitHub issue');
        }
      } catch (error) {
        console.error('Error storing submission as issue:', error);
      }
    }

    // Always store locally in development
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


/**
 * GitHub-based storage service
 * Stores form submissions in a GitHub repository as issues
 */

interface GitHubStorageOptions {
  owner: string;
  repo: string;
  token?: string;
}

export interface Submission {
  email: string;
  quizResults: Record<string, any>;
  timestamp: string;
}

const defaultOptions: GitHubStorageOptions = {
  owner: 'ManyusBuild', // GitHub username
  repo: 'rhythm-bloom-submissions', // Repository for submissions
};

export const storeSubmission = async (
  submission: Submission,
  options: GitHubStorageOptions = defaultOptions
): Promise<boolean> => {
  try {
    // In production, we don't attempt to use GitHub API - store locally only
    // This prevents exposing tokens in client-side code
    if (import.meta.env.PROD) {
      const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
      submissions.push(submission);
      localStorage.setItem('submissions', JSON.stringify(submissions));
      console.log('Submission stored locally:', submission);
      return true;
    }

    // In development, we can attempt to use GitHub API if token is available
    if (options.token) {
      const response = await fetch(`https://api.github.com/repos/${options.owner}/${options.repo}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${options.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `Quiz Submission from ${submission.email}`,
          body: `
# Quiz Submission

## User
Email: ${submission.email}

## Results
\`\`\`json
${JSON.stringify(submission.quizResults, null, 2)}
\`\`\`

Submitted at: ${submission.timestamp}
          `,
          labels: ['quiz-submission']
        })
      });

      if (!response.ok) {
        console.error('Failed to store submission:', await response.text());
        // Fall back to local storage
        const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
        submissions.push(submission);
        localStorage.setItem('submissions', JSON.stringify(submissions));
        return true;
      }

      return true;
    }

    // No token available, use localStorage
    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    submissions.push(submission);
    localStorage.setItem('submissions', JSON.stringify(submissions));
    console.log('Submission stored locally:', submission);
    return true;
  } catch (error) {
    console.error('Error storing submission:', error);
    // Always fallback to local storage on error
    try {
      const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
      submissions.push(submission);
      localStorage.setItem('submissions', JSON.stringify(submissions));
      return true;
    } catch (e) {
      console.error('Failed to store submission locally:', e);
      return false;
    }
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

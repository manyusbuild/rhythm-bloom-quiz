
const { Octokit } = require("@octokit/rest");
const { createAppAuth } = require("@octokit/auth-app");

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Parse request body
    const payload = JSON.parse(event.body);
    const { submission, repository } = payload;
    
    if (!submission || !repository) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    // Load private key from environment variable
    const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
    if (!privateKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: "Server configuration error - missing private key" 
        }),
      };
    }

    // Initialize Octokit with GitHub App authentication
    const octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: process.env.GITHUB_APP_ID || repository.appId,
        privateKey: privateKey.replace(/\\n/g, '\n'),
        installationId: process.env.GITHUB_APP_INSTALLATION_ID || repository.installationId,
      },
    });

    // Trigger repository_dispatch event
    const result = await octokit.repos.createDispatchEvent({
      owner: repository.owner,
      repo: repository.repo,
      event_type: "form_submission",
      client_payload: {
        submission,
      },
    });

    console.log("Repository dispatch event triggered successfully");
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: "Submission processed successfully" 
      }),
    };
  } catch (error) {
    console.error("Error processing submission:", error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Failed to process submission", 
        details: error.message 
      }),
    };
  }
};

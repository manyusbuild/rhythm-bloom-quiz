
const { Octokit } = require("@octokit/rest");
const { createAppAuth } = require("@octokit/auth-app");

// Hard-coded repository information
const REPOSITORY_INFO = {
  owner: 'ManyusBuild',
  repo: 'rhythm-bloom-submissions'
};

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  console.log("Function invoked with method:", event.httpMethod);
  console.log("Request headers:", JSON.stringify(event.headers));

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    console.log(`Method not allowed: ${event.httpMethod}`);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed", method: event.httpMethod }),
    };
  }

  try {
    console.log("Parsing request body");
    // Parse request body
    let payload;
    try {
      payload = JSON.parse(event.body);
      console.log("Request payload:", JSON.stringify(payload));
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: "Invalid JSON in request body", 
          details: parseError.message,
          receivedBody: event.body 
        }),
      };
    }

    const { submission } = payload;
    
    if (!submission) {
      console.error("Missing submission data in payload");
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing submission data" }),
      };
    }

    console.log("Processing submission from:", submission.email);

    // Load GitHub App credentials from environment variables
    const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
    const appId = process.env.GITHUB_APP_ID;
    const installationId = process.env.GITHUB_APP_INSTALLATION_ID;

    // Log environment variable presence (not values for security)
    console.log("Environment variables check:", {
      hasPrivateKey: !!privateKey,
      hasAppId: !!appId,
      hasInstallationId: !!installationId
    });

    // Validate required environment variables
    if (!privateKey || !appId || !installationId) {
      console.error("Missing GitHub App credentials in environment variables");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: "Server configuration error - missing GitHub App credentials" 
        }),
      };
    }

    // Initialize Octokit with GitHub App authentication
    const octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: appId,
        privateKey: privateKey.replace(/\\n/g, '\n'),
        installationId: installationId,
      },
    });

    console.log(`Triggering repository_dispatch event for ${REPOSITORY_INFO.owner}/${REPOSITORY_INFO.repo}`);

    // Trigger repository_dispatch event
    const result = await octokit.repos.createDispatchEvent({
      owner: REPOSITORY_INFO.owner,
      repo: REPOSITORY_INFO.repo,
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
        details: error.message,
        stack: error.stack
      }),
    };
  }
};

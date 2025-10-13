import { ImageAnnotatorClient } from "@google-cloud/vision";

export function createVisionClient() {
  const json = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!json) {
    console.log("🔑 No service account JSON found, will use API key");
    return null;
  }
  
  try {
    const creds = JSON.parse(json);
    
    // Validate required fields
    if (!creds.client_email || !creds.private_key || !creds.project_id) {
      console.log("❌ Service account JSON missing required fields (client_email, private_key, project_id)");
      return null;
    }
    
    console.log("✅ Service account credentials validated");
    return new ImageAnnotatorClient({ 
      credentials: creds, 
      projectId: creds.project_id 
    });
  } catch (error) {
    console.log("❌ Failed to parse service account JSON:", error);
    return null;
  }
}
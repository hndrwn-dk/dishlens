import { ImageAnnotatorClient } from "@google-cloud/vision";

export function createVisionClient() {
  const json = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!json) return null;
  const creds = JSON.parse(json);
  return new ImageAnnotatorClient({ credentials: creds, projectId: creds.project_id });
}
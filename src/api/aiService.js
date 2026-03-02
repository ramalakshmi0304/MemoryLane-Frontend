// src/api/aiService.js
import API from "./axios";

export const triggerAlbumMagic = async (albumId, userId, contextPrompt) => {
  try {
    const response = await API.post("/ai/generate-video", {
      album_id: albumId,
      user_id: userId,
      prompt: contextPrompt,
      preview_only: true // Explicitly tell backend this is a preview
    });
    return response.data;
  } catch (error) {
    console.error("AI Magic Preview Error:", error);
    throw error;
  }
};

// NEW: The confirmation service call
export const confirmAlbumMagic = async (albumId, updates) => {
  try {
    const response = await API.post("/ai/confirm-magic", {
      album_id: albumId,
      updates: updates // This is the array of { id, new_title, new_description }
    });
    return response.data;
  } catch (error) {
    console.error("AI Magic Confirm Error:", error);
    throw error;
  }
};
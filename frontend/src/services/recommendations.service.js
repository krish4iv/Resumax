import axios from "axios";

const RECOMMENDATIONS_API_URL = "http://localhost:5003";

async function getRecommendations(uid) {
  try {
    const response = await axios.get(
      `${RECOMMENDATIONS_API_URL}/api/recommend_jobs/${uid}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recommendations:', error);
    throw error;
  }
}

export default {
    getRecommendations
};

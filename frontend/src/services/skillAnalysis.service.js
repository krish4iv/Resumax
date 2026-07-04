import axios from "axios";

const SKILL_ANALYSIS_API_URL = "http://localhost:5002";

async function getSkillGapAnalysis(uid) {
  try {
    const response = await axios.get(
      `${SKILL_ANALYSIS_API_URL}/api/skill_gap_analysis/${uid}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch skill gap analysis:', error);
    throw error;
  }
}

async function getTrendingSkills() {
  try {
    const response = await axios.get(
      `${SKILL_ANALYSIS_API_URL}/api/trending_skills`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch trending skills:', error);
    throw error;
  }
}

export default {
    getSkillGapAnalysis,
    getTrendingSkills
};

import axios from "axios";

const NEWS_API_URL = "http://localhost:8001";

async function getNews() {
    try {
        const response = await axios.get(`${NEWS_API_URL}/news`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch news:', error);
        throw error;
    }
}

export default {
    getNews
};

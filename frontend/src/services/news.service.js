
import { createExternalApi } from './externalApi.js'
import { API_URLS } from '../config/apiConfig.js'

const newsApi = createExternalApi(API_URLS.news)

async function getNews() {
  const response = await newsApi.get('/news')
  return response.data
}

export default {
  getNews,
}
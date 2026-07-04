import newsService from "../services/news.service.js";
import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout.jsx";
import { Loader2, Newspaper, ExternalLink } from "lucide-react";
import { theme } from "../theme/index.js";

const News = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {

    let cancelled = false  // ← add this
    const fetchNews = async () => {
      try {
        const data = await newsService.getNews()
        if (!cancelled) setArticles(data)
      } catch (error) {
        setError('Failed to load news. Please try again.')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
  }, [])



  if (loading) return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="animate-spin text-blue-500" size={28} />
        <p className={theme.subtext}>Loading latest news...</p>
      </div>
    </MainLayout>
  )
  

  if (error) return (
    <MainLayout>
      <div className="flex justify-center py-20">
        <p className="text-red-400">{error}</p>
      </div>
    </MainLayout>
  )

  if (articles.length === 0) return (
    <MainLayout>
      <div className={`${theme.card} text-center py-16`}>
        <Newspaper size={44} className="mx-auto text-slate-400 mb-3" />
        <p className={`font-medium ${theme.heading}`}>No articles found</p>
        <p className={`${theme.subtext} mt-1`}>Check back later for updates</p>
      </div>
    </MainLayout>
  )

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div>
          <h1 className={`text-2xl font-semibold ${theme.heading}`}>
            Employment News
          </h1>
          <p className={theme.subtext}>
            {articles.length} articles · Latest employment news worldwide
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {articles.map((article) => (
            <div key={article.url} className={`${theme.cardHover} flex flex-col`}>

              {/* Image */}
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                <img
                  src={article.socialimage || 'https://via.placeholder.com/400x200?text=No+Image'}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'}
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
              </a>

              {/* Content */}
              <div className="flex flex-col flex-1">
                <h3 className={`font-semibold ${theme.heading} mb-2 line-clamp-2`}>
                  {article.title}
                </h3>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-medium text-blue-500">
                      {article.domain}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(article.seendate).toLocaleDateString()}
                    </p>
                  </div>

                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${theme.btnGlass} flex items-center gap-1.5 text-xs py-1.5 px-3`}
                  >
                    <ExternalLink size={12} />
                    Read More
                  </a>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </MainLayout>
  )
}

export default News
import React, { useState, useEffect } from "react";

export default function StockNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [symbol, setSymbol] = useState("");

  const fetchNews = async (searchSymbol = "") => {
    setLoading(true);
    setError("");
    try {
      const url = searchSymbol 
        ? `http://localhost:3001/api/market-news?symbol=${searchSymbol}`
        : `http://localhost:3001/api/market-news`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setNews(data);
      }
    } catch {
      setError("Failed to fetch news. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSearch = () => {
    fetchNews(symbol);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-[#fff8f3] to-[#fdf6f0] text-[#4b2e23]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 mt-4">
          <h1 className="text-4xl font-extrabold mb-4">📰 Market & Company News</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest headlines, market trends, and company announcements.
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-10">
          <input
            type="text"
            placeholder="Search Company News (e.g. AAPL) or leave blank for general"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="p-4 border rounded-xl w-full max-w-md shadow-sm focus:ring-2 focus:ring-[#4b2e23] outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-[#4b2e23] text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 shadow-md transition"
          >
            Search
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#4b2e23] mb-4"></div>
             <p className="font-semibold text-lg animate-pulse">Loading latest headlines...</p>
          </div>
        ) : error ? (
           <p className="text-center text-red-500 bg-red-50 p-4 rounded-lg max-w-lg mx-auto">{error}</p>
        ) : news.length === 0 ? (
           <p className="text-center text-gray-500 py-10">No recent news found for this criteria.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.slice(0, 21).map((article, idx) => (
              <a
                key={article.id || idx}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group border border-gray-100"
              >
                {article.image && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={article.image} 
                      alt="News Thumbnail" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-center mb-3 text-xs text-emerald-600 font-bold uppercase tracking-wider">
                    <span>{article.source}</span>
                    <span>{new Date(article.datetime * 1000).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-gray-800 line-clamp-3 group-hover:text-emerald-700 transition-colors">
                    {article.headline}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                    {article.summary}
                  </p>
                  <div className="mt-auto pt-4 border-t border-gray-100 text-sm font-semibold text-emerald-600 group-hover:text-emerald-800 transition-colors flex items-center">
                    Read Article <span className="ml-1 text-lg leading-none group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

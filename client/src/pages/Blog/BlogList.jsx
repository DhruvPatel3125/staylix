import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Newspaper, Search, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Blog.css';

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.blogs.getAll();
      if (response.success) {
        setBlogs(response.blogs);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="blog-page-container">
      {/* Hero Section */}
      <section className="blog-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="badge-premium">Staylix Stories</div>
          <h1>Discover Your Next <span className="text-gradient">Adventure</span></h1>
          <p>Insights, travel guides, and the latest updates from the world of luxury travel.</p>
          
          <div className="search-box-premium">
            <Search size={22} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search articles, guides, stories..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Blog Feed */}
      <section className="blog-feed-section">
        <div className="container">
          <div className="section-header">
            <div className="title-area">
              <Newspaper className="title-icon" />
              <h2>Latest Articles</h2>
            </div>
            <div className="blog-count">{filteredBlogs.length} articles found</div>
          </div>

          {filteredBlogs.length === 0 ? (
            <div className="no-blogs-found">
              <div className="empty-state-icon">
                <Search size={48} />
              </div>
              <h3>No articles match your search</h3>
              <p>Try different keywords or browse our latest posts.</p>
              <button onClick={() => setSearchTerm('')} className="btn-secondary-premium">Clear Search</button>
            </div>
          ) : (
            <div className="blog-grid">
              {filteredBlogs.map((blog, idx) => (
                <article 
                  key={blog._id} 
                  className="blog-card-premium"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="card-image-wrapper">
                    <img src={blog.image} alt={blog.title} />
                    <div className="card-tag">Travel Guide</div>
                  </div>
                  <div className="card-content">
                    <div className="card-meta">
                      <span className="meta-item">
                        <Calendar size={14} />
                        {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="meta-item">
                        <User size={14} />
                        {blog.author?.name || 'Staylix Team'}
                      </span>
                    </div>
                    <h3 className="card-title">{blog.title}</h3>
                    <p className="card-excerpt">{blog.excerpt}</p>
                    <Link to={`/blog/${blog._id}`} className="read-more-btn">
                      Read Article
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-card">
            <div className="newsletter-content">
              <h3>Stay Inspired</h3>
              <p>Join our newsletter and get the best travel stories and exclusive hotel deals delivered to your inbox.</p>
              <div className="newsletter-form">
                <input type="email" placeholder="Your email address" />
                <button className="btn-primary-premium">Subscribe Now</button>
              </div>
              <p className="privacy-note">We respect your privacy. Unsubscribe at any time.</p>
            </div>
            <div className="newsletter-image">
              <img src="https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80&w=1000" alt="Travel" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

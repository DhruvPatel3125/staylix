import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Bookmark, Clock, MessageCircle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Blog.css';

export default function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentBlogs, setRecentBlogs] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlogDetails();
    fetchRecentBlogs();
  }, [id]);

  const fetchBlogDetails = async () => {
    try {
      setLoading(true);
      const response = await api.blogs.getById(id);
      if (response.success) {
        setBlog(response.blog);
      } else {
        navigate('/blogs');
      }
    } catch (error) {
      console.error("Error fetching blog details:", error);
      navigate('/blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentBlogs = async () => {
    try {
      const response = await api.blogs.getAll();
      if (response.success) {
        setRecentBlogs(response.blogs.filter(b => b._id !== id).slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching recent blogs:", error);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!blog) return null;

  return (
    <div className="blog-details-page">
      {/* Article Header */}
      <header className="article-header">
        <div className="container">
          <Link to="/blogs" className="back-link">
            <ArrowLeft size={18} />
            Back to Articles
          </Link>
          <div className="header-meta">
            <span className="badge-category">Travel Experience</span>
            <span className="reading-time">
              <Clock size={14} />
              5 min read
            </span>
          </div>
          <h1>{blog.title}</h1>
          <div className="author-info-large">
            <div className="author-avatar">
              {blog.author?.name?.charAt(0) || 'S'}
            </div>
            <div className="author-text">
              <span className="author-name">Published by {blog.author?.name || 'Staylix Team'}</span>
              <span className="publish-date">
                <Calendar size={14} />
                {new Date(blog.createdAt).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="featured-image-container">
        <div className="container">
          <img src={blog.image} alt={blog.title} className="featured-image" />
        </div>
      </div>

      {/* Article Content */}
      <div className="article-main-container">
        <div className="container article-layout">
          {/* Sidebar / Social Actions */}
          <aside className="article-actions">
            <div className="sticky-actions">
              <button className="action-circle" title="Share">
                <Share2 size={20} />
              </button>
              <button className="action-circle" title="Save">
                <Bookmark size={20} />
              </button>
              <div className="divider-small"></div>
              <a href="#" className="social-icon facebook"><Facebook size={18} /></a>
              <a href="#" className="social-icon twitter"><Twitter size={18} /></a>
              <a href="#" className="social-icon linkedin"><Linkedin size={18} /></a>
            </div>
          </aside>

          {/* Body Content */}
          <main className="article-body">
            <div 
              className="content-rich-text"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {blog.sections && blog.sections.length > 0 && (
              <div className="blog-sections-container">
                {blog.sections.map((section, index) => (
                  <div key={index} className="blog-extra-section">
                    <h3 className="section-heading-detail">{section.heading}</h3>
                    <div className="section-content-detail">{section.content}</div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="article-tags">
              <span className="tag">#LuxuryTravel</span>
              <span className="tag">#StaylixGuides</span>
              <span className="tag">#Vacation</span>
            </div>

            <div className="article-footer">
              <div className="share-box">
                <span>Enjoyed this article? Share it with your friends!</span>
                <div className="share-buttons">
                  <button className="btn-social fb"><Facebook size={16} /> Facebook</button>
                  <button className="btn-social tw"><Twitter size={16} /> Twitter</button>
                </div>
              </div>
            </div>
          </main>

          {/* Related Articles */}
          <aside className="related-sidebar">
            <div className="sidebar-widget">
              <h3>Recent Stories</h3>
              <div className="recent-list">
                {recentBlogs.map(item => (
                  <Link key={item._id} to={`/blog/${item._id}`} className="recent-item">
                    <img src={item.image} alt={item.title} />
                    <div className="recent-item-info">
                      <h4>{item.title}</h4>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="sidebar-widget promo-widget">
              <div className="promo-content">
                <h4>Ready for your next trip?</h4>
                <p>Book the most exclusive hotels with Staylix.</p>
                <Link to="/hotels" className="btn-primary-small">Explore Hotels</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

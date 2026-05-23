import React, { useState, useEffect } from 'react';
import { Newspaper, Plus, Search, Trash2, Edit, X, Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import api from '../../../services/api';
import { showToast, showAlert } from '../../../utils/swal';

export default function BlogsTab() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlogId, setCurrentBlogId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image: null,
    imagePreview: '',
    sections: []
  });

  useEffect(() => {
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
      showToast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setIsEditing(true);
      setCurrentBlogId(blog._id);
      setFormData({
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt,
        image: null,
        imagePreview: blog.image,
        sections: blog.sections || []
      });
    } else {
      setIsEditing(false);
      setCurrentBlogId(null);
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        image: null,
        imagePreview: '',
        sections: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      image: null,
      imagePreview: '',
      sections: []
    });
  };

  const handleAddSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { heading: '', content: '' }]
    });
  };

  const handleRemoveSection = (index) => {
    const newSections = [...formData.sections];
    newSections.splice(index, 1);
    setFormData({ ...formData, sections: newSections });
  };

  const handleSectionChange = (index, field, value) => {
    const newSections = [...formData.sections];
    newSections[index][field] = value;
    setFormData({ ...formData, sections: newSections });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      showToast.error("Title and Content are required");
      return;
    }

    if (!isEditing && !formData.image) {
      showToast.error("Image is required for new blogs");
      return;
    }

    try {
      setSubmitting(true);
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('excerpt', formData.excerpt);
      submitData.append('sections', JSON.stringify(formData.sections));
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      let response;
      if (isEditing) {
        response = await api.blogs.update(currentBlogId, submitData);
      } else {
        response = await api.blogs.create(submitData);
      }

      if (response.success) {
        showToast.success(`Blog ${isEditing ? 'updated' : 'created'} successfully`);
        fetchBlogs();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Submit blog error:", error);
      showToast.error(error.message || "Failed to save blog");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showAlert.confirm("Delete Blog", "Are you sure you want to delete this blog? This action cannot be undone.");
    if (confirmed) {
      try {
        const response = await api.blogs.delete(id);
        if (response.success) {
          showToast.success("Blog deleted successfully");
          setBlogs(blogs.filter(b => b._id !== id));
        }
      } catch (error) {
        showToast.error("Failed to delete blog");
      }
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="blogs-tab-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <div className="section-header-premium">
        <div className="header-titles">
          <h2>Blog Management</h2>
          <p className="subtitle-admin">Create and manage stories, news, and updates for Staylix users.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="add-btn-premium">
          <Plus size={20} />
          Create New Blog
        </button>
      </div>

      <div className="admin-controls-row">
        <div className="search-wrapper">
          <Search size={18} className="search-icon-inside" />
          <input
            type="text"
            className="search-input-premium"
            placeholder="Search blogs by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-wrapper-premium">
        <table className="admin-table-modern">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Author</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="loading-cell">
                  <div className="loader-admin"></div>
                  <p>Loading blogs...</p>
                </td>
              </tr>
            ) : filteredBlogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-cell">
                  <p>No blogs found. Start by creating one!</p>
                </td>
              </tr>
            ) : (
              filteredBlogs.map((blog, idx) => (
                <tr key={blog._id} style={{ animation: `slideInRight 0.4s ease-out ${0.05 * idx}s both` }}>
                  <td>
                    <img src={blog.image} alt={blog.title} className="blog-thumb-admin" />
                  </td>
                  <td className="title-cell-admin">
                    <span className="blog-title-text">{blog.title}</span>
                  </td>
                  <td>{blog.author?.name || 'Admin'}</td>
                  <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-btns-admin">
                      <button className="edit-btn" onClick={() => handleOpenModal(blog)} title="Edit Blog">
                        <Edit size={16} />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(blog._id)} title="Delete Blog">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content blog-modal">
            <div className="modal-header">
              <h3>{isEditing ? 'Edit Blog' : 'Create New Blog'}</h3>
              <button className="close-btn" onClick={handleCloseModal}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="blog-form">
              <div className="form-group">
                <label>Blog Title</label>
                <input
                  type="text"
                  placeholder="Enter blog title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Excerpt (Short Description)</label>
                <textarea
                  placeholder="Enter a brief summary..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label>Blog Content (HTML supported)</label>
                <textarea
                  placeholder="Write your story here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={8}
                />
              </div>

              <div className="form-group">
                <div className="section-header-row">
                  <label>Additional Sections (Q&A Style)</label>
                  <button type="button" className="add-section-btn" onClick={handleAddSection}>
                    <Plus size={16} /> Add Section
                  </button>
                </div>
                
                <div className="sections-list">
                  {formData.sections.map((section, index) => (
                    <div key={index} className="section-item-admin">
                      <div className="section-item-header">
                        <span>Section #{index + 1}</span>
                        <button type="button" className="remove-section-btn" onClick={() => handleRemoveSection(index)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Section Heading (e.g., Question)"
                        value={section.heading}
                        onChange={(e) => handleSectionChange(index, 'heading', e.target.value)}
                        className="section-heading-input"
                      />
                      <textarea
                        placeholder="Section Content (e.g., Answer)"
                        value={section.content}
                        onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                        rows={3}
                        className="section-content-input"
                      />
                    </div>
                  ))}
                  {formData.sections.length === 0 && (
                    <div className="empty-sections-hint">No additional sections added yet.</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Blog Image</label>
                <div className="image-upload-wrapper">
                  {formData.imagePreview ? (
                    <div className="preview-container">
                      <img src={formData.imagePreview} alt="Preview" />
                      <label htmlFor="blog-image" className="change-img-overlay">
                        <ImageIcon size={20} />
                        Change Image
                      </label>
                    </div>
                  ) : (
                    <label htmlFor="blog-image" className="upload-placeholder">
                      <ImageIcon size={40} />
                      <span>Click to upload blog image</span>
                    </label>
                  )}
                  <input
                    type="file"
                    id="blog-image"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="save-btn" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {isEditing ? 'Update Blog' : 'Publish Blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .admin-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }
        .admin-modal-content {
          background: #ffffff;
          border-radius: 24px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          border-bottom: 1px solid #f1f5f9;
        }
        .modal-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .close-btn {
          background: #f1f5f9;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }
        .close-btn:hover {
          background: #fee2e2;
          color: #ef4444;
          transform: rotate(90deg);
        }
        .modal-footer {
          padding: 20px 32px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: #f8fafc;
          border-radius: 0 0 24px 24px;
        }
        .cancel-btn {
          padding: 10px 20px;
          border-radius: 12px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #64748b;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cancel-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .save-btn {
          padding: 10px 24px;
          border-radius: 12px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          border: none;
          color: #ffffff;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .save-btn:hover {
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
          transform: translateY(-2px);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .blog-form .form-group label {
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
        }
        .blog-form .form-group input, .blog-form .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 14px;
          transition: all 0.3s;
          box-sizing: border-box;
        }
        .blog-form .form-group input:focus, .blog-form .form-group textarea:focus {
          outline: none;
          border-color: #6366f1;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .blog-thumb-admin {
          width: 80px;
          height: 50px;
          object-fit: cover;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .title-cell-admin {
          max-width: 300px;
        }
        .blog-title-text {
          font-weight: 600;
          color: #1e293b;
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .blog-modal {
          width: 90%;
          max-width: 800px !important;
        }
        .blog-form {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .image-upload-wrapper {
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }
        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          cursor: pointer;
          color: #94a3b8;
          gap: 10px;
          transition: all 0.3s;
        }
        .upload-placeholder:hover {
          background: #f8fafc;
          color: #4f46e5;
          border-color: #4f46e5;
        }
        .preview-container {
          position: relative;
          height: 200px;
        }
        .preview-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .change-img-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #fff;
          font-weight: 600;
          opacity: 0;
          transition: 0.3s;
          cursor: pointer;
        }
        .preview-container:hover .change-img-overlay {
          opacity: 1;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .section-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .add-section-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          background: #f0f9ff;
          color: #0369a1;
          border: 1px solid #bae6fd;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .sections-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          max-height: 300px;
          overflow-y: auto;
          padding: 10px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        .section-item-admin {
          background: #fff;
          padding: 15px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .section-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
        }
        .remove-section-btn {
          color: #ef4444;
          background: none;
          border: none;
          cursor: pointer;
        }
        .section-heading-input {
          font-weight: 600 !important;
          border: 1px solid #e2e8f0 !important;
          background: #f8fafc !important;
        }
        .empty-sections-hint {
          text-align: center;
          padding: 20px;
          color: #94a3b8;
          font-style: italic;
          font-size: 13px;
        }
      `}} />
    </div>
  );
}

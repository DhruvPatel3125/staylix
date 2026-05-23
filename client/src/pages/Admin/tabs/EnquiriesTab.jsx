import React, { useState, useEffect } from 'react';
import { Mail, Search, Eye, X, Calendar, User, Phone, Tag } from 'lucide-react';
import api from '../../../services/api';
import { showToast } from '../../../utils/swal';

export default function EnquiriesTab() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchEnquiries();
  }, [page, searchTerm]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const response = await api.contact.getAllEnquiries({
        page,
        limit: 10,
        keyword: searchTerm
      });
      if (response.success) {
        setEnquiries(response.data);
        setTotalPages(Math.ceil(response.pagination.total / response.pagination.limit));
      }
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      showToast.error("Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const openEnquiry = (enquiry) => {
    setSelectedEnquiry(enquiry);
  };

  const closeEnquiry = () => {
    setSelectedEnquiry(null);
  };

  return (
    <div className="enquiries-tab-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <div className="section-header-premium">
        <div className="header-titles">
          <h2>Enquiries Management</h2>
          <p className="subtitle-admin">Review and manage user contact messages.</p>
        </div>
      </div>

      <div className="admin-controls-row">
        <div className="search-wrapper">
          <Search size={18} className="search-icon-inside" />
          <input
            type="text"
            className="search-input-premium"
            placeholder="Search by name, email, or subject..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="admin-table-wrapper-premium">
        <table className="admin-table-modern">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="loading-cell">
                  <div className="loader-admin"></div>
                  <p>Loading enquiries...</p>
                </td>
              </tr>
            ) : enquiries.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-cell">
                  <p>No enquiries found.</p>
                </td>
              </tr>
            ) : (
              enquiries.map((enq, idx) => (
                <tr key={enq._id} style={{ animation: `slideInRight 0.4s ease-out ${0.05 * idx}s both` }}>
                  <td className="font-semibold">{enq.name}</td>
                  <td>{enq.email}</td>
                  <td>{enq.subject}</td>
                  <td>{new Date(enq.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-btns-admin">
                      <button className="view-btn" onClick={() => openEnquiry(enq)} title="View Details" style={{ color: '#3b82f6', background: '#eff6ff', padding: '6px', borderRadius: '6px' }}>
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          <button 
            disabled={page === 1} 
            onClick={() => setPage(page - 1)}
            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', background: page === 1 ? '#f8fafc' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          <span style={{ padding: '8px 16px', background: '#4f46e5', color: '#fff', borderRadius: '6px' }}>
            Page {page} of {totalPages}
          </span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(page + 1)}
            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', background: page === totalPages ? '#f8fafc' : '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      )}

      {selectedEnquiry && (
        <div className="admin-modal-overlay" onClick={closeEnquiry}>
          <div className="admin-modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Enquiry Details</h3>
              <button className="close-btn" onClick={closeEnquiry}><X size={24} /></button>
            </div>
            <div className="enquiry-details" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <User size={18} color="#64748b"/>
                  <div>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>Name</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>{selectedEnquiry.name}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mail size={18} color="#64748b"/>
                  <div>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>Email</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>
                      <a href={`mailto:${selectedEnquiry.email}`} style={{ color: '#4f46e5', textDecoration: 'none' }}>
                        {selectedEnquiry.email}
                      </a>
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone size={18} color="#64748b"/>
                  <div>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>Phone</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>{selectedEnquiry.phone || 'N/A'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={18} color="#64748b"/>
                  <div>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>Date Submitted</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>{new Date(selectedEnquiry.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                  <Tag size={18} color="#64748b" style={{ marginTop: '2px' }}/>
                  <div>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>Subject</p>
                    <p style={{ margin: 0, fontWeight: 600 }}>{selectedEnquiry.subject}</p>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 8px 0', fontWeight: 'bold', textTransform: 'uppercase' }}>Message</p>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#334155' }}>
                  {selectedEnquiry.message}
                </p>
              </div>

            </div>
            <div className="modal-footer">
              <button type="button" className="cancel-btn" onClick={closeEnquiry}>Close</button>
              <a href={`mailto:${selectedEnquiry.email}?subject=Re: ${selectedEnquiry.subject}`} className="save-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} /> Reply via Email
              </a>
            </div>
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
      `}} />
    </div>
  );
}

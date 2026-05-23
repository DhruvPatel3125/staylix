import React, { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle, XCircle, ChevronRight, Eye } from 'lucide-react';
import api from '../../../services/api';

export default function AutomationLogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayload, setSelectedPayload] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.admin.getWebhookLogs();
      if (response.success) {
        setLogs(response.logs);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms) => {
    if (!ms) return 'N/A';
    return `${ms}ms`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="automation-logs-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <div className="section-header-premium">
        <div className="header-titles">
          <h2>Automation Logs</h2>
          <p className="subtitle-admin">Track all webhook activities and automation triggers in real-time.</p>
        </div>
        <button onClick={fetchLogs} className="refresh-btn-premium">
          <Activity size={20} className={loading ? 'animate-spin' : ''} />
          Refresh Logs
        </button>
      </div>

      <div className="logs-summary-grid">
        <div className="log-stat-card">
          <div className="stat-icon success">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="label">Successful Triggers</span>
            <span className="value">{logs.filter(l => l.status === 'success').length}</span>
          </div>
        </div>
        <div className="log-stat-card">
          <div className="stat-icon failure">
            <XCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="label">Failed Attempts</span>
            <span className="value">{logs.filter(l => l.status === 'failed').length}</span>
          </div>
        </div>
      </div>

      <div className="admin-table-wrapper-premium" style={{ marginTop: '20px' }}>
        <table className="admin-table-modern">
          <thead>
            <tr>
              <th>Event</th>
              <th>Status</th>
              <th>Resp. Time</th>
              <th>Details</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="loader-admin"></div>
                  <p>Loading automation history...</p>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                  <p>No automation logs found yet.</p>
                </td>
              </tr>
            ) : (
              logs.map((log, idx) => (
                <tr key={log._id} style={{ animation: `slideInRight 0.4s ease-out ${0.05 * idx}s both` }}>
                  <td>
                    <div className="event-cell">
                      <span className="event-name">{log.event}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${log.status}`}>
                      {log.status === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="time-cell">
                      <Clock size={14} />
                      {formatTime(log.responseTime)}
                    </div>
                  </td>
                  <td>
                    <button 
                      className="view-payload-btn"
                      onClick={() => setSelectedPayload(log.payload)}
                    >
                      <Eye size={16} />
                      View Data
                    </button>
                  </td>
                  <td className="timestamp-cell">
                    {formatDate(log.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Payload Modal */}
      {selectedPayload && (
        <div className="modal-overlay" onClick={() => setSelectedPayload(null)}>
          <div className="payload-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Event Payload</h3>
              <button className="close-btn" onClick={() => setSelectedPayload(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <pre>{JSON.stringify(selectedPayload, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .refresh-btn-premium {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: #fff;
          color: #4f46e5;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .refresh-btn-premium:hover {
          background: #f8fafc;
          border-color: #4f46e5;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .logs-summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 10px;
        }
        .log-stat-card {
          background: #fff;
          padding: 20px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          border: 1px solid #f1f5f9;
        }
        .stat-icon.success { color: #10b981; background: #ecfdf5; padding: 10px; border-radius: 12px; }
        .stat-icon.failure { color: #ef4444; background: #fef2f2; padding: 10px; border-radius: 12px; }
        .stat-info .label { font-size: 13px; color: #64748b; display: block; }
        .stat-info .value { font-size: 20px; font-weight: 700; color: #1e293b; }
        
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .status-pill.success { background: #ecfdf5; color: #059669; border: 1px solid #10b98133; }
        .status-pill.failed { background: #fef2f2; color: #dc2626; border: 1px solid #ef444433; }
        
        .event-name { font-weight: 600; color: #4f46e5; background: #f5f3ff; padding: 4px 10px; border-radius: 6px; }
        .time-cell { display: flex; align-items: center; gap: 6px; color: #64748b; font-size: 13px; }
        .timestamp-cell { font-size: 13px; color: #94a3b8; }
        
        .view-payload-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #f1f5f9;
          color: #475569;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .view-payload-btn:hover { background: #e2e8f0; color: #1e293b; }
        
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }
        .payload-modal {
          background: #fff;
          width: 90%;
          max-width: 600px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          animation: slideUp 0.3s ease-out;
        }
        .modal-header {
          padding: 20px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-header h3 { margin: 0; font-size: 18px; color: #1e293b; }
        .close-btn { background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; }
        .modal-body { padding: 20px; max-height: 400px; overflow-y: auto; }
        .modal-body pre { background: #1e293b; color: #f1f5f9; padding: 20px; border-radius: 12px; font-size: 13px; margin: 0; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}} />
    </div>
  );
}

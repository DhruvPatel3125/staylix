import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Trash2, Clock, CheckCircle } from 'lucide-react';

export default function UsersTab() {
  const { 
    users, 
    searchTerm, 
    setSearchTerm, 
    handleBlockUser, 
    handleDeleteUser, 
    processingId 
  } = useOutletContext();

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="users-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <div className="section-header-modern">
        <div className="header-info">
          <h2>User Registry</h2>
          <p className="subtitle-admin">Manage platform access and security for all accounts.</p>
        </div>
        <div className="search-wrapper">
          <Search size={18} className="search-icon-inside" />
          <input
            type="text"
            className="search-input-premium"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="empty-state-premium">
          <p>{searchTerm ? 'No matches found' : 'No users available'}</p>
        </div>
      ) : (
        <div className="admin-table-wrapper-premium" style={{ animation: 'fadeInScale 0.6s ease-out 0.2s both' }}>
          <table className="admin-table-modern">
            <thead>
              <tr>
                <th>Identity</th>
                <th>Role</th>
                <th>Access Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => (
                <tr key={user._id} style={{ animation: `slideInRight 0.4s ease-out ${0.05 * idx}s both` }}>
                  <td>
                    <div className="user-profile-cell">
                      <div className="user-avatar-small">{user.name.charAt(0)}</div>
                      <div className="user-info-stack">
                        <span className="user-name-bold">{user.name}</span>
                        <span className="user-email-muted">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge-premium ${user.role}`}>{user.role}</span></td>
                  <td>
                    <span className={`status-pill-modern ${user.isBlocked ? 'blocked' : 'active'}`}>
                      {user.isBlocked ? 'Restricted' : 'Authorized'}
                    </span>
                  </td>
                  <td>
                    <div className="compact-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className={`action-btn-circle ${user.isBlocked ? 'enable' : 'disable'}`}
                        onClick={() => handleBlockUser(user._id, user.isBlocked ? 'blocked' : 'active')}
                        disabled={processingId === user._id}
                        title={user.isBlocked ? 'Unblock User' : 'Block User'}
                      >
                        {processingId === user._id ? '...' : (user.isBlocked ? <CheckCircle size={18} /> : <Clock size={18} />)}
                      </button>
                      <button
                        className="action-btn-circle delete"
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={processingId === user._id}
                        title="Delete User"
                      >
                        {processingId === user._id ? '...' : <Trash2 size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

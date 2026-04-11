import { useOutletContext } from 'react-router-dom';
import { Search, Trash2, Clock, CheckCircle } from 'lucide-react';

export default function OwnersTab() {
  const { 
    users, 
    searchTerm, 
    setSearchTerm, 
    handleBlockUser, 
    handleDeleteUser, 
    processingId 
  } = useOutletContext();

  const filteredOwners = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = user.role === 'owner';

    return matchesSearch && matchesRole;
  });

  return (
    <div className="owners-section" style={{ animation: 'slideInRight 0.6s ease-out both' }}>
      <div className="section-header-modern">
        <div className="header-info">
          <h2>Owner Registry</h2>
          <p className="subtitle-admin">Manage platform access for property owners.</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="search-wrapper">
            <Search size={18} className="search-icon-inside" />
            <input
              type="text"
              className="search-input-premium"
              placeholder="Search owners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredOwners.length === 0 ? (
        <div className="empty-state-premium">
          <p>{searchTerm ? 'No matches found' : 'No owners available'}</p>
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
              {filteredOwners.map((owner, idx) => (
                <tr key={owner._id} style={{ animation: `slideInRight 0.4s ease-out ${0.05 * idx}s both` }}>
                  <td>
                    <div className="user-profile-cell">
                      <div className="user-avatar-small">{owner.name.charAt(0)}</div>
                      <div className="user-info-stack">
                        <span className="user-name-bold">{owner.name}</span>
                        <span className="user-email-muted">{owner.email}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge-premium ${owner.role}`}>{owner.role}</span></td>
                  <td>
                    <span className={`status-pill-modern ${owner.isBlocked ? 'blocked' : 'active'}`}>
                      {owner.isBlocked ? 'Restricted' : 'Authorized'}
                    </span>
                  </td>
                  <td>
                    <div className="compact-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className={`action-btn-circle ${owner.isBlocked ? 'enable' : 'disable'}`}
                        onClick={() => handleBlockUser(owner._id, owner.isBlocked ? 'blocked' : 'active')}
                        disabled={processingId === owner._id}
                        title={owner.isBlocked ? 'Unblock Owner' : 'Block Owner'}
                      >
                        {processingId === owner._id ? '...' : (owner.isBlocked ? <CheckCircle size={18} /> : <Clock size={18} />)}
                      </button>
                      <button
                        className="action-btn-circle delete"
                        onClick={() => handleDeleteUser(owner._id)}
                        disabled={processingId === owner._id}
                        title="Delete Owner"
                      >
                        {processingId === owner._id ? '...' : <Trash2 size={18} />}
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

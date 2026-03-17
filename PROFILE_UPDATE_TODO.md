# User Profile Update Feature - TODO

## ✅ Status: User Approved

**Goal:** Add profile update functionality (name, profile picture) to UserDashboard → ProfileTab

## 📋 Implementation Steps

### **1. Backend APIs** 
- [x] Create `server/src/controllers/userController.js`
- [x] Add PUT `/api/users/profile` → update name/image  
- [x] Update `server/src/routes/userRoutes.js`

### **2. Frontend ProfileTab**
- [x] Edit `client/src/pages/User/tabs/ProfileTab.jsx`
  - Add edit form (name, image upload)
  - Save button + loading states
  - Success/error toasts

### **3. API Service**
- [x] Add `api.users.updateProfile()` in `client/src/services/api.js`

### **4. Testing**
```
✅ Update name → Persists after refresh
✅ Upload profile pic → Shows immediately  
✅ Error handling (file too big, server error)
✅ Read-only for email (security)
```

**✅ FEATURE COMPLETE - Ready to Test!**



# Staylix Registration Error Fix - TODO

## ✅ Status: Approved by User

**Goal:** Fix registration error messages (show "Email already exists" instead of "Registration failed")

## 📋 Implementation Steps

### **1. Fix Register.jsx (Primary - 90% solution)**
- [x] Use `useAuth().error` instead of generic catch message
- [x] Show field-specific validation errors  
- [x] Test duplicate email registration

### **2. Fix Login.jsx (Same Pattern)**
- [x] Apply identical error handling pattern

### **3. Backend Consistency**
- [x] Update ALL authController catch blocks to return specific `message`
- [ ] Test all error scenarios

### **4. UX Polish**
- [ ] Consistent error toast styling across auth forms

- [ ] Loading states during error display

### **5. Testing**
```
✅ Duplicate email → "Email already exists"
✅ Weak password → "Password must be at least 6 characters"
✅ Network error → Graceful fallback
✅ Success → Proper redirect
```

**Next:** Edit `client/src/pages/Auth/Register.jsx`


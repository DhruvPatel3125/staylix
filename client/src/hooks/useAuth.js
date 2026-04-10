import { useSelector, useDispatch } from 'react-redux';
import { loginUser, registerUser, logoutUser, clearErrors, verifyOTP as verifyOTPAction, googleLogin as googleLoginAction } from '../store/slices/authSlice';

const useAuth = () => {
    const dispatch = useDispatch();
    const { user, token, isAuthenticated, loading, error, isUnverified } = useSelector((state) => state.auth);

    const login = async (email, password) => {
        return dispatch(loginUser({ email, password })).unwrap();
    };

    const register = async (userData) => {
        return dispatch(registerUser(userData)).unwrap();
    };

    const verifyOTP = async (email, otp) => {
        return dispatch(verifyOTPAction({ email, otp })).unwrap();
    };

    const googleAuth = async (credential) => {
        return dispatch(googleLoginAction(credential)).unwrap();
    };

    const logout = () => {
        dispatch(logoutUser());
    };

    return {
        user,
        token,
        isAuthenticated,
        loading,
        error,
        isUnverified,
        login,
        register,
        verifyOTP,
        googleAuth,
        logout,
        clearErrors: () => dispatch(clearErrors())
    };

};

export default useAuth;

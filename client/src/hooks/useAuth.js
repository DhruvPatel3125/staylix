import { useSelector, useDispatch } from 'react-redux';
import { loginUser, registerUser, logoutUser, clearErrors } from '../store/slices/authSlice';

const useAuth = () => {
    const dispatch = useDispatch();
    const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

    const login = async (email, password) => {
        return dispatch(loginUser({ email, password })).unwrap();
    };

    const register = async (userData) => {
        return dispatch(registerUser(userData)).unwrap();
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
        login,
        register,
        logout,
        clearErrors: () => dispatch(clearErrors())
    };
};

export default useAuth;

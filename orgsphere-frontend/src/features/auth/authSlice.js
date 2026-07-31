import { createSlice } from '@reduxjs/toolkit';

// Helper - safe read from localStorage
const getStoredOrgId = () => {
    const raw = localStorage.getItem('organizationId');
    if (raw && raw !== 'null' && raw !== 'undefined' && raw !== '') return parseInt(raw, 10);
    const user = localStorage.getItem('user');
    if (user) {
        try { return JSON.parse(user)?.organizationId || null; } catch { return null; }
    }
    return null;
};

const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    organizationType: localStorage.getItem('organizationType') || null,
    organizationId: getStoredOrgId(),
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, token, organizationType } = action.payload;
            state.user = user;
            state.token = token;
            state.organizationType = organizationType || user?.organizationType || null;
            state.organizationId = user?.organizationId || null;
            state.isAuthenticated = true;
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            if (organizationType || user?.organizationType) {
                localStorage.setItem('organizationType', organizationType || user?.organizationType);
            }
            // Always store organizationId — even if null, to overwrite stale values
            localStorage.setItem('organizationId', user?.organizationId ? String(user.organizationId) : '');
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.organizationType = null;
            state.organizationId = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('organizationType');
            localStorage.removeItem('organizationId');
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const { setCredentials, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
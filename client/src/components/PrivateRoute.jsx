import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ adminOnly = false, allowShared = false, allowedRoles = [] }) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // 1. Check if User is Authenticated
    if (!userInfo || !userInfo.token) {
        return <Navigate to="/login" replace />;
    }

    const getRoleDashboard = (role) => {
        if (role === 'admin') return '/admin';
        if (role === 'faculty') return '/faculty/dashboard';
        return '/dashboard';
    };

    // 2. Check Role Authorization
    if (adminOnly && userInfo.role !== 'admin') {
        return <Navigate to={getRoleDashboard(userInfo.role)} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userInfo.role)) {
        return <Navigate to={getRoleDashboard(userInfo.role)} replace />;
    }

    if (!adminOnly && !allowShared && !allowedRoles.includes('admin') && userInfo.role === 'admin') {
        return <Navigate to="/admin" replace />;
    }

    // 3. Render Child Route
    return <Outlet />;
};

export default PrivateRoute;

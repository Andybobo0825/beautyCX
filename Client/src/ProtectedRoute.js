// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { LoginContext } from './ContextAPI';

const ProtectedRoute = ({ element, allowedRoles }) => {
    const { login, setLogin } = useContext(LoginContext);

    if (!allowedRoles.includes(login)) {
        return <Navigate to="/LoginPage" />;
    }

    return element;
};

export default ProtectedRoute;
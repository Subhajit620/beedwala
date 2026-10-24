import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { LoadingSpinner } from "../Loading";

export default function AdminProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAdminAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
                <LoadingSpinner text="Authenticating administrator session..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return children;
}

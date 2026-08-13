import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import LoadingScreen from "../components/LoadingScreen/LoadingScreen";

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <LoadingScreen
                text="Loading your account..."
            />
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;
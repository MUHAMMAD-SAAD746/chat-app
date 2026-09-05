import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import LoadingScreen from "../components/LoadingScreen/LoadingScreen";

function PublicRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <LoadingScreen
                text="Checking your account..."
            />
        );
    }

    if (user) {
        return <Navigate to="/chat" replace />;
    }

    return children;
}

export default PublicRoute;
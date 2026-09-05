import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Auth/login/Login";
import Register from "./pages/Auth/Register/Register";
import Chat from "./pages/chat/Chat";
import ChatLayout from "./components/chat/ChatLayout/ChatLayout";
import Friends from "./pages/Friends/Friends";
import Settings from "./pages/Settings/Settings";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/toast.css";

import { useTheme } from "./context/ThemeContext";
import { useAuth } from "./context/AuthContext";

function App() {
  const { darkMode } = useTheme();


  function HomeRedirect() {
    const { user, loading } = useAuth();

    if (loading) {
      return null;
    }

    return (
      <Navigate
        to={user ? "/chat" : "/login"}
        replace
      />
    );
  }



  return (
    <div>
      <Routes>
        <Route path="*" element={<Navigate to="/login" replace />} />


        <Route
          path="/"
          element={
            <Navigate to="/login" replace />
          }
        />


        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />


        <Route
          element={
            <ProtectedRoute>
              <ChatLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/add-contact" element={<Chat />} />
          <Route path="/chat/:conversationId" element={<Chat />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>

      <ToastContainer
        transition={Slide}
        theme={darkMode ? "dark" : "light"}
      />
    </div>
  );
}

export default App;
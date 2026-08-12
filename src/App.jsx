import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import Chat from "./pages/chat/chat";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (


    <div>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate to="/login" replace />
          }
        />


        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:conversationId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
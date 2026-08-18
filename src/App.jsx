import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import Chat from "./pages/chat/Chat";
import ChatLayout from "./components/chat/ChatLayout/ChatLayout";
import Friends from "./pages/Friends/Friends";
import Settings from "./pages/Settings/Settings";
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

        {/* <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        /> */}

        {/* <Route
          path="/chat/add-contact"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        /> */}

        {/* <Route
          path="/chat/:conversationId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        /> */}

        {/* <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <ChatLayout>
                <Settings />
              </ChatLayout>
            </ProtectedRoute>
          }
        /> */}

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
    </div>
  );
}

export default App;
import {
  Routes,
  Route,
  Link,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./components/Chat";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div>

      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          background: "#111827",
        }}
      >
        <h2>Connectify</h2>

        <div
          style={{
            display: "flex",
            gap: "20px",
          }}
        >
          <Link to="/">Chat</Link>

          <Link to="/login">
            Login
          </Link>

          <Link to="/register">
            Register
          </Link>
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
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
      </Routes>
    </div>
  );
}

export default App;
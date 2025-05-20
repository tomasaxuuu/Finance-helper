import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProfilePage from "./pages/ProfiePage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import PrivateRoute from "./components/PrivateRoute";
import "./styles/main.scss";
import Advisor from "./pages/Advisor";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/pages/Advisor"
          element={
            <PrivateRoute>
              <Advisor />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

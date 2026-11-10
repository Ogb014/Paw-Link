import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { BreederDashboardPage } from "./pages/BreederDashboardPage";
import { BuyerDashboardPage } from "./pages/BuyerDashboardPage";
import { DogListPage } from "./pages/DogListPage";
import { DogFormPage } from "./pages/DogFormPage";
import { DogDetailPage } from "./pages/DogDetailPage";
import { LittersPage } from "./pages/LittersPage";
import { MessagesPage } from "./pages/MessagesPage";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";

function RoleDashboard() {
  const { profile } = useAuth();
  const role = profile?.role ?? "breeder";

  if (role === "buyer" || role === "service_seeker") {
    return <BuyerDashboardPage />;
  }
  return <BreederDashboardPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<RoleDashboard />} />
            <Route path="dogs" element={<DogListPage />} />
            <Route path="dogs/new" element={<DogFormPage />} />
            <Route path="dogs/:dogId" element={<DogDetailPage />} />
            <Route path="dogs/:dogId/edit" element={<DogFormPage />} />
            <Route path="litters" element={<LittersPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="messages/:conversationId" element={<MessagesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

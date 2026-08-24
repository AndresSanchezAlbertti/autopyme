import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import { ProtectedRoute } from "@/router/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";

// Pages
import LoginPage from "@/app/login/page";
import DashboardPage from "@/app/(dashboard)/dashboard/page";
import LeadsPage from "@/app/(dashboard)/leads/page";
import LeadDetailPage from "@/app/(dashboard)/leads/[id]/page";
import AutomationsPage from "@/app/(dashboard)/automations/page";
import ConversationsPage from "@/app/(dashboard)/conversations/page";
import IntegrationsPage from "@/app/(dashboard)/integrations/page";
import ProductosPage from "@/app/(dashboard)/productos/page";
import SettingsPage from "@/app/(dashboard)/settings/page";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="leads/:id" element={<LeadDetailPage />} />
              <Route path="automations" element={<AutomationsPage />} />
              <Route path="conversations" element={<ConversationsPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="productos" element={<ProductosPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

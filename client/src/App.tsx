import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Chat from "@/pages/Chat";
import SubscriptionPage from "@/pages/SubscriptionPage";
import CompanionSettings from "@/pages/CompanionSettings";
import CompanionSettingsPage from "@/pages/CompanionSettingsPage";
import AllCompanions from "@/pages/AllCompanions";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminImageGenerator from "@/pages/AdminImageGenerator";
import AuthPage from "@/pages/AuthPage";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen gradient-bg font-sans text-white">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/auth" component={AuthPage} />
            <ProtectedRoute path="/dashboard" component={Dashboard} />
            <Route path="/chat/:id" component={Chat} />
            <ProtectedRoute path="/settings/companion/:id" component={CompanionSettings} />
            <Route path="/companion-settings/:id" component={CompanionSettingsPage} />
            <ProtectedRoute path="/membership" component={SubscriptionPage} />
            <Route path="/subscription" component={SubscriptionPage} />
            <Route path="/companions" component={AllCompanions} />
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/images" component={AdminImageGenerator} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
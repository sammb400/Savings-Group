import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/lib/AuthContext";
import { Spinner } from "@/components/shared/Spinner";

// Pages
import AuthPage from "@/pages/auth";
import DashboardPage from "@/pages/dashboard";
import MembersPage from "@/pages/members";
import SettingsPage from "@/pages/settings";

function Router() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        {currentUser ? <Redirect to="/dashboard" /> : <AuthPage />}
      </Route>
      <Route path="/dashboard">
        {currentUser ? <DashboardPage /> : <Redirect to="/" />}
      </Route>
      <Route path="/members">
        {currentUser ? <MembersPage /> : <Redirect to="/" />}
      </Route>
      <Route path="/settings">
        {currentUser ? <SettingsPage /> : <Redirect to="/" />}
      </Route>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

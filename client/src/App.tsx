import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const isGitHubPages = import.meta.env.VITE_GITHUB_PAGES === "true";
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {isGitHubPages ? (
          <Router hook={useHashLocation}>
            <AppRouter />
          </Router>
        ) : (
          <AppRouter />
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

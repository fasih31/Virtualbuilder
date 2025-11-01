import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Studio from "@/pages/studio";
import Marketplace from "@/pages/marketplace";
import AIStudio from "@/pages/ai-studio";
import WebsiteStudio from "@/pages/website-studio";
import BotStudio from "@/pages/bot-studio";
import GameStudio from "@/pages/game-studio";
import { VirtuCopilot } from "@/components/VirtuCopilot";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading VirtuBuild.ai...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Home} />
          <Route component={Home} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/studio/:type" component={Studio} />
          <Route path="/studio/:type/:id" component={Studio} />
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/ai-studio" component={AIStudio} />
          <Route path="/website-studio" component={WebsiteStudio} />
          <Route path="/bot-studio" component={BotStudio} />
          <Route path="/game-studio" component={GameStudio} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Router />
          <VirtuCopilot />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
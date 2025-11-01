import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { VirtuCopilot } from "@/components/VirtuCopilot";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/home"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const Studio = lazy(() => import("./pages/studio")); // Assuming Studio is also lazy-loaded
const Marketplace = lazy(() => import("./pages/marketplace"));
const AIStudio = lazy(() => import("./pages/ai-studio"));
const WebsiteStudio = lazy(() => import("./pages/website-studio"));
const BotStudio = lazy(() => import("./pages/bot-studio"));
const GameStudio = lazy(() => import("./pages/game-studio"));
const Web3Studio = lazy(() => import("./pages/web3-studio"));
const NotFound = lazy(() => import("./pages/not-found")); // Assuming NotFound is also lazy-loaded
const EnhancedDashboard = lazy(() => import("./pages/enhanced-dashboard")); // New page

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
    <div className="text-center space-y-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
      <p className="text-muted-foreground animate-pulse">Loading VirtuBuild.ai...</p>
    </div>
  </div>
);

function Router() {
  // The original Router component logic is now integrated into the App component's Suspense and Switch.
  // We'll retain the structure for clarity if needed, but the actual routing is handled by Suspense.
  // If the auth logic needs to be preserved, it should be re-integrated here or within the App component.
  // For now, assuming the core routing with Suspense is the intended replacement.

  // The original loading logic from Router is replaced by Suspense's fallback.
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/studio/:type" component={Studio} />
      <Route path="/studio/:type/:id" component={Studio} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/ai-studio" component={AIStudio} />
      <Route path="/website-studio" component={WebsiteStudio} />
      <Route path="/bot-studio" component={BotStudio} />
      <Route path="/game-studio" component={GameStudio} />
      <Route path="/web3-studio" component={Web3Studio} />
      <Route path="/analytics" component={EnhancedDashboard} /> {/* New route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Suspense fallback={<LoadingFallback />}>
            <Router /> {/* Router component now uses lazy-loaded components */}
          </Suspense>
          <VirtuCopilot />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
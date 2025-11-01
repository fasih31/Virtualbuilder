import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Globe, MessageSquare, Gamepad2, Coins, Sparkles, Zap, Users } from "lucide-react";

const studios = [
  {
    id: "ai",
    name: "AI Studio",
    description: "Build intelligent AI applications with GPT, Claude, and Gemini",
    icon: Brain,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "website",
    name: "Website Studio",
    description: "Create stunning websites with live code editor and instant preview",
    icon: Globe,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "bot",
    name: "Bot Studio",
    description: "Design custom chatbots and conversational AI assistants",
    icon: MessageSquare,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "game",
    name: "Game Studio",
    description: "Build interactive games and experiences with ease",
    icon: Gamepad2,
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: "web3",
    name: "Web3 Studio",
    description: "Create blockchain apps and smart contracts",
    icon: Coins,
    gradient: "from-yellow-500 to-orange-500",
  },
];

const features = [
  {
    icon: Zap,
    title: "Instant Deployment",
    description: "Deploy your projects with one click and share them instantly",
    link: "/dashboard",
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    description: "VirtuCopilot helps you build faster with intelligent suggestions",
    link: "/ai-studio",
  },
  {
    icon: Users,
    title: "Community Marketplace",
    description: "Discover, clone, and remix projects from the community",
    link: "/marketplace",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(108,99,255,0.1),transparent_50%)]"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">The Future of AI Development</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
            Build Anything with AI
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            VirtuBuild.ai is your complete AI creation studio. Build apps, websites, bots, games, and Web3 projects with instant deployment.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-20">
            <Button 
              size="lg" 
              className="text-lg px-8 h-12" 
              data-testid="button-get-started"
              onClick={() => window.location.href = '/api/login'}
            >
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 h-12" 
              data-testid="button-learn-more"
              onClick={() => window.scrollBy({ top: 400, behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6 hover-elevate">
                <feature.icon className="w-12 h-12 text-primary mb-4 mx-auto" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Choose Your Studio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studios.map((studio) => (
                <Card key={studio.id} className="p-6 hover-elevate active-elevate-2 cursor-pointer group" data-testid={`card-studio-${studio.id}`}>
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${studio.gradient} flex items-center justify-center mb-4 neon-glow-hover`}>
                    <studio.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{studio.name}</h3>
                  <p className="text-muted-foreground text-sm">{studio.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

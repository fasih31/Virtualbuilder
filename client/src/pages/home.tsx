import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Brain, Code, Gamepad2, MessageSquare, Rocket } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const studios = [
  {
    title: "AI Studio",
    description: "Build AI chatbots and assistants",
    icon: Brain,
    href: "/ai-studio",
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Website Builder",
    description: "Create websites with AI",
    icon: Code,
    href: "/website-studio",
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Game Studio",
    description: "Build games instantly",
    icon: Gamepad2,
    href: "/game-studio",
    color: "from-green-500 to-emerald-500"
  },
  {
    title: "Bot Builder",
    description: "Create Discord/Telegram bots",
    icon: MessageSquare,
    href: "/bot-studio",
    color: "from-orange-500 to-red-500"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b p-4 sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold gradient-text">VirtuBuild.ai</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6 text-center">
        <h1 className="text-5xl font-bold gradient-text mb-6">
          Build Anything with AI
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Create websites, games, bots, and AI apps in minutes. No coding required.
        </p>
        <Link href="/dashboard">
          <Button size="lg" className="text-lg px-8">
            <Rocket className="w-5 h-5 mr-2" />
            Start Building Free
          </Button>
        </Link>
      </section>

      {/* Studios */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Studio</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {studios.map((studio) => (
              <Link key={studio.href} href={studio.href}>
                <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${studio.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <studio.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{studio.title}</h3>
                  <p className="text-sm text-muted-foreground">{studio.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
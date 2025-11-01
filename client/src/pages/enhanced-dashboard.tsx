
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, Users, Zap, Eye, Download, Star } from "lucide-react";

export default function EnhancedDashboard() {
  const { data: analytics = [] } = useQuery({
    queryKey: ["/api/analytics/user"],
  });

  const totalViews = analytics.filter((e: any) => e.eventType === "view").length;
  const totalDeploys = analytics.filter((e: any) => e.eventType === "deploy").length;
  const totalClones = analytics.filter((e: any) => e.eventType === "clone").length;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold gradient-text mb-8">Analytics Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-3xl font-bold">{totalViews}</p>
                <p className="text-xs text-green-500 mt-1">+12% this week</p>
              </div>
              <Eye className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deployments</p>
                <p className="text-3xl font-bold">{totalDeploys}</p>
                <p className="text-xs text-green-500 mt-1">+8% this week</p>
              </div>
              <Zap className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clones</p>
                <p className="text-3xl font-bold">{totalClones}</p>
                <p className="text-xs text-orange-500 mt-1">+24% this week</p>
              </div>
              <Download className="w-10 h-10 text-orange-500 opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-3xl font-bold">4.8</p>
                <p className="text-xs text-yellow-500 mt-1">⭐⭐⭐⭐⭐</p>
              </div>
              <Star className="w-10 h-10 text-yellow-500 opacity-50" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Top Projects</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Project Performance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">AI Assistant Bot</span>
                    <span className="text-sm font-semibold">89%</span>
                  </div>
                  <Progress value={89} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Portfolio Website</span>
                    <span className="text-sm font-semibold">76%</span>
                  </div>
                  <Progress value={76} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">NFT Marketplace</span>
                    <span className="text-sm font-semibold">92%</span>
                  </div>
                  <Progress value={92} />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card className="p-6">
              <p className="text-muted-foreground">Top performing projects will appear here</p>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="p-6">
              <div className="space-y-3">
                {analytics.slice(0, 10).map((event: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-muted rounded">
                    <Activity className="w-4 h-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.eventType}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="secondary">{event.eventType}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

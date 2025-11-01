
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, ExternalLink, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface DeploymentManagerProps {
  projectId: string;
}

export function DeploymentManager({ projectId }: DeploymentManagerProps) {
  const { toast } = useToast();

  const { data: deployments = [] } = useQuery({
    queryKey: [`/api/projects/${projectId}/deployments`],
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const deployMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/projects/${projectId}/deploy`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/deployments`] });
      toast({
        title: "Deployment Started",
        description: "Your project is being deployed...",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "deployed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "pending":
      case "building":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "deployed":
        return "bg-green-500/10 text-green-500";
      case "failed":
        return "bg-red-500/10 text-red-500";
      case "pending":
      case "building":
        return "bg-blue-500/10 text-blue-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Deployments</h3>
        <Button
          onClick={() => deployMutation.mutate()}
          disabled={deployMutation.isPending}
          size="sm"
        >
          <Rocket className="w-4 h-4 mr-2" />
          Deploy Now
        </Button>
      </div>

      <div className="space-y-3">
        {deployments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No deployments yet
          </p>
        ) : (
          deployments.map((deployment: any) => (
            <div
              key={deployment.id}
              className="flex items-center justify-between p-3 bg-muted rounded"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(deployment.status)}
                <div>
                  <p className="text-sm font-medium">
                    {new Date(deployment.createdAt).toLocaleString()}
                  </p>
                  <Badge className={getStatusColor(deployment.status)} variant="secondary">
                    {deployment.status}
                  </Badge>
                </div>
              </div>
              {deployment.url && deployment.status === "deployed" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(deployment.url, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

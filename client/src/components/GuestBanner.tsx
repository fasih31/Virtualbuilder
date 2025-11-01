
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export function GuestBanner() {
  return (
    <Card className="p-4 mb-6 border-primary/50 bg-primary/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-primary" />
          <div>
            <p className="font-semibold">Guest Mode - Try Everything Free!</p>
            <p className="text-sm text-muted-foreground">
              Sign in to save your projects and deploy them
            </p>
          </div>
        </div>
        <Button onClick={() => window.location.href = '/api/login'}>
          Sign In Free
        </Button>
      </div>
    </Card>
  );
}

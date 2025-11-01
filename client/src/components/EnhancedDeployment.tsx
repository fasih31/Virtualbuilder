
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Rocket, 
  Download, 
  ExternalLink, 
  Shield, 
  FileText, 
  Globe,
  CheckCircle,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnhancedDeploymentProps {
  projectCode: {
    html?: string;
    css?: string;
    js?: string;
  };
  projectName: string;
  projectId: string;
}

const hostingProviders = [
  { 
    id: 'vercel', 
    name: 'Vercel', 
    description: 'Zero-config deployments with global CDN',
    features: ['Auto SSL', 'Global CDN', 'Instant rollbacks']
  },
  { 
    id: 'netlify', 
    name: 'Netlify', 
    description: 'Modern web hosting with serverless functions',
    features: ['Auto SSL', 'Forms', 'Split testing']
  },
  { 
    id: 'render', 
    name: 'Render', 
    description: 'Build and run apps with free SSL',
    features: ['Auto SSL', 'DDoS protection', 'Global CDN']
  },
  { 
    id: 'railway', 
    name: 'Railway', 
    description: 'Deploy from GitHub instantly',
    features: ['Auto SSL', 'Database support', 'Custom domains']
  }
];

export function EnhancedDeployment({ projectCode, projectName, projectId }: EnhancedDeploymentProps) {
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState('vercel');
  const [domain, setDomain] = useState('');
  const [robotsTxt, setRobotsTxt] = useState('');
  const [sitemapXml, setSitemapXml] = useState('');

  const deployMutation = useMutation({
    mutationFn: async (provider: string) => {
      const response = await fetch('/api/deploy/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          provider,
          code: projectCode
        })
      });
      if (!response.ok) throw new Error('Deployment preparation failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Deployment Package Ready!",
        description: `Your project is ready to deploy to ${data.provider}`,
      });
    }
  });

  const downloadZip = async () => {
    try {
      const prepareResponse = await fetch('/api/deploy/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          provider: selectedProvider,
          code: projectCode
        })
      });
      
      const { files } = await prepareResponse.json();
      
      const downloadResponse = await fetch('/api/deploy/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files,
          projectName
        })
      });
      
      const blob = await downloadResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started!",
        description: "Your project files are being downloaded",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download project files",
        variant: "destructive"
      });
    }
  };

  const generateRobotsTxt = async () => {
    try {
      const response = await fetch('/api/seo/robots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });
      const { content } = await response.json();
      setRobotsTxt(content);
      toast({ title: "robots.txt Generated!" });
    } catch (error) {
      toast({ title: "Generation Failed", variant: "destructive" });
    }
  };

  const generateSitemap = async () => {
    try {
      const response = await fetch('/api/seo/sitemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          domain,
          pages: ['/'] 
        })
      });
      const { content } = await response.json();
      setSitemapXml(content);
      toast({ title: "sitemap.xml Generated!" });
    } catch (error) {
      toast({ title: "Generation Failed", variant: "destructive" });
    }
  };

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${name} Copied!` });
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="deploy" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
          <TabsTrigger value="seo">SEO Tools</TabsTrigger>
          <TabsTrigger value="ssl">SSL Info</TabsTrigger>
        </TabsList>

        <TabsContent value="deploy" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              Choose Hosting Provider
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {hostingProviders.map((provider) => (
                <Card
                  key={provider.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    selectedProvider === provider.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{provider.name}</h4>
                    {selectedProvider === provider.id && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {provider.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {provider.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              className="flex-1" 
              size="lg"
              onClick={downloadZip}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Project Files
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.open(`https://${selectedProvider}.com`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Go to {selectedProvider}
            </Button>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Quick Deploy Steps:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Download your project files using the button above</li>
              <li>Create a free account on {selectedProvider}</li>
              <li>Upload your project or connect GitHub</li>
              <li>Deploy with automatic SSL certificate!</li>
            </ol>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <div>
            <Label>Your Domain</Label>
            <Input
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="mb-4"
            />
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  robots.txt
                </Label>
                <div className="flex gap-2">
                  <Button size="sm" onClick={generateRobotsTxt}>
                    Generate
                  </Button>
                  {robotsTxt && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(robotsTxt, 'robots.txt')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <Textarea
                value={robotsTxt}
                readOnly
                placeholder="Click 'Generate' to create robots.txt"
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  sitemap.xml
                </Label>
                <div className="flex gap-2">
                  <Button size="sm" onClick={generateSitemap}>
                    Generate
                  </Button>
                  {sitemapXml && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(sitemapXml, 'sitemap.xml')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <Textarea
                value={sitemapXml}
                readOnly
                placeholder="Click 'Generate' to create sitemap.xml"
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ssl" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold">SSL Certificate Information</h3>
          </div>

          <Card className="p-4 bg-green-500/10 border-green-500/20">
            <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
              ✓ Automatic SSL with Hosting Providers
            </h4>
            <p className="text-sm text-muted-foreground">
              All recommended hosting providers (Vercel, Netlify, Render, Railway) 
              automatically provision FREE SSL certificates from Let's Encrypt when 
              you deploy your project.
            </p>
          </Card>

          <div>
            <h4 className="font-semibold mb-2">What You Get:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>FREE SSL certificate (valued at $50-200/year)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Automatic renewal every 90 days</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>HTTPS enabled by default</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Browser trust indicators (padlock icon)</span>
              </li>
            </ul>
          </div>

          <Card className="p-4 bg-muted">
            <h4 className="font-semibold mb-2">No Configuration Needed!</h4>
            <p className="text-sm text-muted-foreground">
              Simply deploy your project to any of our recommended providers, 
              and SSL will be automatically configured. For custom domains, 
              add your domain in the provider's dashboard and SSL will be 
              provisioned within minutes.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

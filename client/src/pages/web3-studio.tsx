
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link2, Shield, Sparkles, Code, Rocket, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const contractTemplates = [
  { id: "erc20", name: "ERC-20 Token", description: "Fungible token standard", icon: "🪙" },
  { id: "erc721", name: "ERC-721 NFT", description: "Non-fungible token standard", icon: "🎨" },
  { id: "staking", name: "Staking Contract", description: "Token staking rewards", icon: "💰" },
  { id: "dao", name: "DAO Governance", description: "Decentralized organization", icon: "🏛️" },
  { id: "tokensale", name: "Token Sale", description: "ICO/IDO contract", icon: "🚀" },
];

const networks = [
  { value: "ethereum", label: "Ethereum Mainnet" },
  { value: "polygon", label: "Polygon" },
  { value: "bsc", label: "Binance Smart Chain" },
  { value: "sepolia", label: "Sepolia Testnet" },
];

export default function Web3Studio() {
  const { toast } = useToast();
  const [projectName, setProjectName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [network, setNetwork] = useState("sepolia");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [totalSupply, setTotalSupply] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  const createContract = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/web3/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create contract");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Smart Contract Created!", description: "Ready to deploy on blockchain." });
    },
  });

  const auditContract = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch("/api/web3/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      return response.json();
    },
  });

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link2 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold gradient-text">Web3 Studio</h1>
          <Badge variant="secondary">Blockchain Development</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <Tabs defaultValue="setup" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="setup">Setup</TabsTrigger>
                <TabsTrigger value="parameters">Parameters</TabsTrigger>
                <TabsTrigger value="audit">AI Audit</TabsTrigger>
                <TabsTrigger value="deploy">Deploy</TabsTrigger>
              </TabsList>

              <TabsContent value="setup" className="space-y-6 mt-6">
                <div>
                  <Label>Contract Name</Label>
                  <Input
                    placeholder="MyToken"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Select Template</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {contractTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={`p-4 cursor-pointer transition-all ${
                          selectedTemplate === template.id ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <div className="text-2xl mb-2">{template.icon}</div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>AI Smart Contract Generator</Label>
                  <Textarea
                    placeholder="Create an ERC-20 token with 1 million supply and burn mechanism..."
                    rows={4}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="mt-2"
                  />
                  <Button className="mt-2" disabled={!aiPrompt}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Contract
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="parameters" className="space-y-6 mt-6">
                <div>
                  <Label>Token Name</Label>
                  <Input
                    placeholder="My Token"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Token Symbol</Label>
                  <Input
                    placeholder="MTK"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Total Supply</Label>
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={totalSupply}
                    onChange={(e) => setTotalSupply(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Network</Label>
                  <Select value={network} onValueChange={setNetwork}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {networks.map((net) => (
                        <SelectItem key={net.value} value={net.value}>
                          {net.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="audit" className="space-y-6 mt-6">
                <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                  <Shield className="w-5 h-5 text-primary" />
                  <p className="text-sm">AI will scan your contract for vulnerabilities</p>
                </div>
                <Button onClick={() => auditContract.mutate("")}>
                  Run Security Audit
                </Button>
              </TabsContent>

              <TabsContent value="deploy" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <Button className="w-full" size="lg">
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                  <Button className="w-full" variant="outline" size="lg">
                    <Rocket className="w-4 h-4 mr-2" />
                    Deploy to {networks.find(n => n.value === network)?.label}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Web3 Features</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-primary" />
                  <span>Solidity Smart Contracts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>AI Security Auditor</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span>Wallet Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-primary" />
                  <span>Multi-chain Deployment</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

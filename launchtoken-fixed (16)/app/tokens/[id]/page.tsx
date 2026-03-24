'use client';

import Link from 'next/link';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, ExternalLink, Rocket, Code, Download, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Token } from "@shared/schema";
const logoImg = '/logo-optimized.webp';

function generateSolidity(token: Token) {
  const safeName = token.tokenName.replace(/\s/g, '') || 'CustomToken';
  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ${safeName} is ERC20 {
    constructor() ERC20("${token.tokenName}", "${token.tokenSymbol}") {
        _mint(msg.sender, ${token.totalSupply} * 10 ** ${token.decimals});
    }

    function decimals() public pure override returns (uint8) {
        return ${token.decimals};
    }
}`;
}

export default function TokenDetailPage() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const router = useRouter();

  const { data: token, isLoading } = useQuery<Token>({
    queryKey: ["/api/tokens", params.id],
  });

  const deployMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/tokens/${params.id}/deploy`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens", params.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      toast({ title: "Token deployed!", description: "Your token has been deployed to Sepolia testnet." });
    },
    onError: (error: any) => {
      toast({
        title: "Deploy failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/tokens/${params.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      toast({ title: "Token deleted", description: "Your token has been removed." });
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };

  const downloadContract = () => {
    if (!token) return;
    const code = generateSolidity(token);
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${token.tokenName.replace(/\s/g, '')}.sol`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="h-5 w-32" />
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-48 rounded-md" />
          <Skeleton className="h-64 rounded-md" />
        </main>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Token not found.</p>
            <Link href="/dashboard">
              <Button data-testid="button-back-dash">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const solidityCode = generateSolidity(token);

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" data-testid="button-back-detail">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="LaunchToken" className="w-8 h-8 rounded-md object-cover" />
            <span className="font-bold text-lg" data-testid="text-detail-name">{token.tokenName}</span>
          </div>
          <Badge variant={token.deployed ? "default" : "secondary"} className="ml-auto" data-testid="badge-detail-status">
            {token.deployed ? "Deployed" : "Draft"}
          </Badge>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-info-title">Token Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Token Name</p>
                  <p className="font-medium" data-testid="text-info-name">{token.tokenName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Symbol</p>
                  <p className="font-medium font-mono" data-testid="text-info-symbol">{token.tokenSymbol}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Supply</p>
                  <p className="font-medium font-mono" data-testid="text-info-supply">
                    {Number(token.totalSupply).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Decimals</p>
                  <p className="font-medium font-mono">{token.decimals}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Network</p>
                  <p className="font-medium">{token.network}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created</p>
                  <p className="font-medium">
                    {token.createdAt ? new Date(token.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                {token.contractAddress && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Contract Address</p>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm bg-muted px-2 py-1 rounded-md break-all" data-testid="text-info-contract">
                        {token.contractAddress}
                      </code>
                      <button
                        onClick={() => copyToClipboard(token.contractAddress!, "Contract address")}
                        className="text-muted-foreground flex-shrink-0"
                        data-testid="button-copy-contract"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={`https://sepolia.etherscan.io/address/${token.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary flex-shrink-0"
                        data-testid="link-etherscan-detail"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}
                {token.description && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{token.description}</p>
                  </div>
                )}
              </div>

              {!token.deployed && (
                <div className="mt-6 p-4 rounded-md bg-primary/5 border border-primary/20">
                  <p className="text-sm mb-3">
                    Ready to deploy your token to the Sepolia testnet? This will simulate a deployment.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <Button
                      className="gap-2"
                      onClick={() => deployMutation.mutate()}
                      disabled={deployMutation.isPending}
                      data-testid="button-deploy"
                    >
                      <Rocket className="w-4 h-4" />
                      {deployMutation.isPending ? "Deploying..." : "Deploy Token"}
                    </Button>
                    <Button
                      variant="destructive"
                      className="gap-2"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this token?")) {
                          deleteMutation.mutate();
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      data-testid="button-delete"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2" data-testid="text-code-title">
                  <Code className="w-5 h-5 text-primary" /> Smart Contract
                </CardTitle>
                <CardDescription>Auto-generated ERC-20 Solidity contract</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={downloadContract} data-testid="button-download">
                <Download className="w-3 h-3" /> Download
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-muted p-4 font-mono text-xs leading-relaxed overflow-x-auto">
                <pre className="text-muted-foreground whitespace-pre-wrap" data-testid="text-contract-code">{solidityCode}</pre>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

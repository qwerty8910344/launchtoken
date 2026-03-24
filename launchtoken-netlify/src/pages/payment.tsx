import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Copy, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { Token } from "@shared/schema";
import logoImg from "@assets/logo-optimized.webp";
import qrTRX from "@assets/IMG_04D527C3E76A-1_1773051370449.jpeg";
import qrBSC from "@assets/IMG_59BA0E82BB1F-1_1773051370450.jpeg";
import qrETH from "@assets/IMG_93E6158008DF-1_2_1773051370450.jpeg";

const GAS_FEE = "59 USDT";

const NETWORKS = [
  {
    id: "trx",
    name: "TRX",
    label: "Tron (TRC-20)",
    address: "THfY7vq5KBFxHYHXZDyo1ouBbuqqUaSiys",
    qr: qrTRX,
  },
  {
    id: "bsc",
    name: "BSC",
    label: "BNB Smart Chain (BEP-20)",
    address: "0x3ca55d3c619db7dd1735796eb377226d6d917187",
    qr: qrBSC,
  },
  {
    id: "eth",
    name: "ETH",
    label: "Ethereum (ERC-20)",
    address: "0x3ca55d3c619db7dd1735796eb377226d6d917187",
    qr: qrETH,
  },
];

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [confirmed, setConfirmed] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);

  const { data: token, isLoading } = useQuery<Token>({
    queryKey: ["/api/tokens", params.id],
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/tokens/${params.id}/confirm-payment`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens", params.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      setConfirmed(true);
      toast({ title: "Payment noted", description: "Your payment is being verified." });
    },
    onError: (error: any) => {
      toast({
        title: "Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const copyAddress = () => {
    navigator.clipboard.writeText(selectedNetwork.address);
    toast({ title: "Copied!", description: `${selectedNetwork.name} address copied to clipboard.` });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="h-5 w-32" />
          </div>
        </nav>
        <main className="max-w-3xl mx-auto px-4 py-8">
          <Skeleton className="h-96 rounded-md" />
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

  if (confirmed || token.paymentStatus === "awaiting_confirmation") {
    return (
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" data-testid="button-back-confirmed">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="LaunchToken" className="w-8 h-8 rounded-md object-cover" />
              <span className="font-bold text-lg">Payment Status</span>
            </div>
          </div>
        </nav>
        <main className="max-w-3xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2" data-testid="text-pending-title">Pending Payment Confirmation</h2>
                    <p className="text-muted-foreground max-w-md">
                      Payment verification may take <strong>24-72 hours</strong>. You will receive an email once your payment has been confirmed.
                    </p>
                  </div>
                  <div className="w-full max-w-sm space-y-3">
                    <div className="flex items-center justify-between gap-2 p-3 rounded-md bg-muted">
                      <span className="text-sm text-muted-foreground">Token</span>
                      <span className="font-medium" data-testid="text-pending-token">{token.tokenName} ({token.tokenSymbol})</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-3 rounded-md bg-muted">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant="secondary" data-testid="badge-pending-status">
                        <Clock className="w-3 h-3 mr-1" /> Awaiting Confirmation
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-3 rounded-md bg-muted">
                      <span className="text-sm text-muted-foreground">Gas Fee</span>
                      <span className="font-mono font-medium text-primary">{GAS_FEE}</span>
                    </div>
                  </div>
                  <Link href="/dashboard">
                    <Button className="gap-2" data-testid="button-go-dashboard">
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" data-testid="button-back-payment">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="LaunchToken" className="w-8 h-8 rounded-md object-cover" />
            <span className="font-bold text-lg">Gas Fee Payment</span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl" data-testid="text-payment-title">Gas Fee Required</CardTitle>
              <CardDescription>
                Complete the payment to process your token: <strong>{token.tokenName} ({token.tokenSymbol})</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-8">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary/10 border border-primary/20">
                    <span className="text-3xl font-bold text-primary" data-testid="text-gas-fee">{GAS_FEE}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Tether (USDT)</p>
                </div>

                <div className="w-full max-w-md">
                  <p className="text-sm font-medium text-center mb-3">Select Network</p>
                  <div className="flex gap-2 justify-center">
                    {NETWORKS.map((net) => (
                      <button
                        key={net.id}
                        onClick={() => setSelectedNetwork(net)}
                        className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all ${
                          selectedNetwork.id === net.id
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                        data-testid={`button-network-${net.id}`}
                      >
                        {net.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">{selectedNetwork.label}</p>
                </div>

                <div className="rounded-xl overflow-hidden border border-border shadow-sm">
                  <img
                    src={selectedNetwork.qr}
                    alt={`${selectedNetwork.name} QR Code`}
                    className="w-64 h-auto"
                    data-testid="img-qr-code"
                  />
                </div>

                <div className="w-full max-w-md space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Send <strong>{GAS_FEE}</strong> via <strong>{selectedNetwork.name}</strong> network to:
                    </p>
                    <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                      <code className="font-mono text-xs break-all flex-1" data-testid="text-wallet-address">{selectedNetwork.address}</code>
                      <button
                        onClick={copyAddress}
                        className="text-muted-foreground flex-shrink-0 p-1 hover:text-foreground transition-colors"
                        data-testid="button-copy-wallet"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-md bg-muted/50 border border-border space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-muted-foreground">
                        <p className="mb-1">Send exactly <strong>{GAS_FEE}</strong> using the <strong>{selectedNetwork.name}</strong> network.</p>
                        <p className="mb-1">Do not send NFTs to this address.</p>
                        <p>After sending, click the button below to notify us.</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={() => confirmMutation.mutate()}
                    disabled={confirmMutation.isPending}
                    data-testid="button-confirm-payment"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {confirmMutation.isPending ? "Confirming..." : "I Have Sent Payment"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

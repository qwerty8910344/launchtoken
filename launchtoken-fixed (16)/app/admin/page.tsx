'use client';

import { useState } from "react";
import Link from 'next/link';
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, XCircle, Clock, Plus, Trash2, Star, Shield } from "lucide-react";
import { motion } from "framer-motion";
import type { Token, ExchangeListing } from "@shared/schema";
const logoImg = '/logo-optimized.webp';

function getStatusBadge(status: string | null) {
  switch (status) {
    case "confirmed":
      return <Badge>Approved</Badge>;
    case "awaiting_confirmation":
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="secondary">Unpaid</Badge>;
  }
}

function TokenRequestRow({ token }: { token: Token }) {
  const { toast } = useToast();

  const approveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/tokens/${token.id}/approve`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tokens"] });
      toast({ title: "Token approved", description: `${token.tokenName} has been approved.` });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/tokens/${token.id}/reject`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tokens"] });
      toast({ title: "Token rejected", description: `${token.tokenName} has been rejected.` });
    },
  });

  return (
    <tr className="border-b border-border/50" data-testid={`admin-row-token-${token.id}`}>
      <td className="py-3 px-4 font-medium">{token.tokenName}</td>
      <td className="py-3 px-4 font-mono text-sm">{token.tokenSymbol}</td>
      <td className="py-3 px-4 font-mono text-sm">{Number(token.totalSupply).toLocaleString()}</td>
      <td className="py-3 px-4 text-sm">{token.contactEmail || "N/A"}</td>
      <td className="py-3 px-4">{getStatusBadge(token.paymentStatus)}</td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {token.createdAt ? new Date(token.createdAt).toLocaleDateString() : "N/A"}
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-1 flex-wrap">
          {token.paymentStatus === "awaiting_confirmation" && (
            <>
              <Button
                size="sm"
                className="gap-1"
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                data-testid={`button-approve-${token.id}`}
              >
                <CheckCircle className="w-3 h-3" /> Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1"
                onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isPending}
                data-testid={`button-reject-${token.id}`}
              >
                <XCircle className="w-3 h-3" /> Reject
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function AddListingDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState("4.5");
  const [days, setDays] = useState("30");
  const [fee, setFee] = useState("199");

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/exchange-listings", {
        exchangeName: name,
        rating: parseFloat(rating),
        estimatedListingDays: parseInt(days),
        listingFee: parseInt(fee),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/exchange-listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exchange-listings"] });
      toast({ title: "Exchange added", description: `${name} has been added.` });
      setOpen(false);
      setName("");
      setRating("4.5");
      setDays("30");
      setFee("199");
    },
    onError: () => {
      toast({ title: "Failed", description: "Could not add exchange.", variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" data-testid="button-add-exchange">
          <Plus className="w-4 h-4" /> Add Exchange
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Exchange Listing</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium">Exchange Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Exchange name" data-testid="input-exchange-name" />
          </div>
          <div>
            <label className="text-sm font-medium">Rating (out of 5)</label>
            <Input type="number" step="0.1" min="0" max="5" value={rating} onChange={e => setRating(e.target.value)} data-testid="input-exchange-rating" />
          </div>
          <div>
            <label className="text-sm font-medium">Estimated Listing Days</label>
            <Input type="number" min="28" value={days} onChange={e => setDays(e.target.value)} data-testid="input-exchange-days" />
          </div>
          <div>
            <label className="text-sm font-medium">Listing Fee (USDT)</label>
            <Input type="number" min="199" value={fee} onChange={e => setFee(e.target.value)} data-testid="input-exchange-fee" />
          </div>
          <Button
            className="w-full"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !name}
            data-testid="button-submit-exchange"
          >
            {createMutation.isPending ? "Adding..." : "Add Exchange"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ExchangeListingRow({ listing }: { listing: ExchangeListing }) {
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/admin/exchange-listings/${listing.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/exchange-listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exchange-listings"] });
      toast({ title: "Deleted", description: `${listing.exchangeName} removed.` });
    },
  });

  return (
    <tr className="border-b border-border/50" data-testid={`admin-row-listing-${listing.id}`}>
      <td className="py-3 px-4 font-medium">{listing.exchangeName}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-primary fill-primary" />
          <span>{listing.rating?.toFixed(1) || "N/A"}</span>
        </div>
      </td>
      <td className="py-3 px-4">{listing.estimatedListingDays} days</td>
      <td className="py-3 px-4 font-mono text-primary">{listing.listingFee} USDT</td>
      <td className="py-3 px-4">
        <Badge variant={listing.active ? "default" : "secondary"}>{listing.active ? "Active" : "Inactive"}</Badge>
      </td>
      <td className="py-3 px-4">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            if (confirm(`Delete ${listing.exchangeName}?`)) deleteMutation.mutate();
          }}
          disabled={deleteMutation.isPending}
          data-testid={`button-delete-listing-${listing.id}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
}

export default function AdminPage() {
  const { user } = useAuth();

  const { data: allTokens, isLoading: tokensLoading } = useQuery<Token[]>({
    queryKey: ["/api/admin/tokens"],
  });

  const { data: listings, isLoading: listingsLoading } = useQuery<ExchangeListing[]>({
    queryKey: ["/api/admin/exchange-listings"],
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Admin access required.</p>
            <Link href="/dashboard">
              <Button data-testid="button-back-dash">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" data-testid="button-back-admin">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="LaunchToken" className="w-8 h-8 rounded-md object-cover" />
            <span className="font-bold text-lg" data-testid="text-admin-title">Admin Panel</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="tokens" className="space-y-6">
          <TabsList data-testid="tabs-admin">
            <TabsTrigger value="tokens" data-testid="tab-tokens">Token Requests</TabsTrigger>
            <TabsTrigger value="exchanges" data-testid="tab-exchanges">Exchange Listings</TabsTrigger>
          </TabsList>

          <TabsContent value="tokens">
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-requests-title">Token Requests</CardTitle>
                <CardDescription>View and manage all token creation requests</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {tokensLoading ? (
                  <div className="p-6 space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded-md animate-pulse" />)}
                  </div>
                ) : allTokens && allTokens.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-admin-tokens">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Symbol</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Supply</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allTokens.map(token => (
                          <TokenRequestRow key={token.id} token={token} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">No token requests yet.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exchanges">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                <div>
                  <CardTitle data-testid="text-listings-title">Exchange Listings</CardTitle>
                  <CardDescription>Manage available exchange listing options</CardDescription>
                </div>
                <AddListingDialog />
              </CardHeader>
              <CardContent className="p-0">
                {listingsLoading ? (
                  <div className="p-6 space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded-md animate-pulse" />)}
                  </div>
                ) : listings && listings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-admin-listings">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Exchange</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rating</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Listing Time</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fee</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listings.map(listing => (
                          <ExchangeListingRow key={listing.id} listing={listing} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">No exchange listings yet.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

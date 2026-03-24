'use client';

import { useState, useRef } from "react";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getAuthHeaders } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Code, Sparkles, Upload, X, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
const logoImg = '/logo-optimized.webp';

const createTokenFormSchema = z.object({
  tokenName: z.string().min(1, "Token name is required").max(50),
  tokenSymbol: z.string().min(1, "Symbol is required").max(10).transform(v => v.toUpperCase()),
  totalSupply: z.string().min(1, "Total supply is required"),
  decimals: z.coerce.number().min(0).max(18).default(18),
  description: z.string().optional(),
  contactEmail: z.string().email("Valid email is required"),
});

type CreateTokenForm = z.infer<typeof createTokenFormSchema>;

function SolidityPreview({ name, symbol, supply, decimals }: { name: string; symbol: string; supply: string; decimals: number }) {
  const code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ${name.replace(/\s/g, '') || 'CustomToken'} is ERC20 {
    constructor() ERC20("${name || 'TokenName'}", "${symbol || 'TKN'}") {
        _mint(msg.sender, ${supply || '1000000'} * 10 ** ${decimals});
    }

    function decimals() public pure override returns (uint8) {
        return ${decimals};
    }
}`;

  return (
    <div className="rounded-md bg-muted p-4 font-mono text-xs leading-relaxed overflow-x-auto">
      <pre className="text-muted-foreground whitespace-pre-wrap" data-testid="text-solidity-preview">{code}</pre>
    </div>
  );
}

export default function CreateTokenPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateTokenForm>({
    resolver: zodResolver(createTokenFormSchema),
    defaultValues: {
      tokenName: "",
      tokenSymbol: "",
      totalSupply: "1000000",
      decimals: 18,
      description: "",
      contactEmail: "",
    },
  });

  const watchName = form.watch("tokenName");
  const watchSymbol = form.watch("tokenSymbol");
  const watchSupply = form.watch("totalSupply");
  const watchDecimals = form.watch("decimals");

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "image/png") {
      toast({ title: "Invalid file", description: "Only PNG files are allowed", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max file size is 2MB", variant: "destructive" });
      return;
    }

    setLogoPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("logo", file);
      const headers = getAuthHeaders();
      const res = await fetch("/api/upload-logo", {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Upload failed");
      }
      const data = await res.json();
      setLogoUrl(data.logoUrl);
      toast({ title: "Logo uploaded" });
    } catch (err: any) {
      setLogoPreview(null);
      setLogoUrl(null);
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setLogoUrl(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const createMutation = useMutation({
    mutationFn: async (data: CreateTokenForm) => {
      const res = await apiRequest("POST", "/api/tokens", { ...data, logoUrl });
      return res.json();
    },
    onSuccess: (token) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      toast({ title: "Token created!", description: "Redirecting to gas fee payment..." });
      router.push(`/payment/${token.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create token",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateTokenForm) => {
    createMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="LaunchToken" className="w-8 h-8 rounded-md object-cover" />
            <span className="font-bold text-lg">Create Token</span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="text-form-title">
                  <Sparkles className="w-5 h-5 text-primary" /> Token Details
                </CardTitle>
                <CardDescription>Configure your ERC-20 token</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="tokenName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., My Token" data-testid="input-token-name" {...field} />
                          </FormControl>
                          <FormDescription>The full name of your token</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tokenSymbol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token Symbol</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., MTK" maxLength={10} data-testid="input-token-symbol" {...field} />
                          </FormControl>
                          <FormDescription>A short abbreviation (max 10 characters)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="totalSupply"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Supply</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="e.g., 1000000" data-testid="input-total-supply" {...field} />
                          </FormControl>
                          <FormDescription>The total number of tokens to mint</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="decimals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Decimals</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} max={18} data-testid="input-decimals" {...field} />
                          </FormControl>
                          <FormDescription>Number of decimal places (0-18)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Token Logo (Optional)</label>
                      <div className="flex items-start gap-4">
                        {logoPreview ? (
                          <div className="relative">
                            <img
                              src={logoPreview}
                              alt="Token logo"
                              className="w-20 h-20 rounded-lg border border-border object-cover"
                              data-testid="img-logo-preview"
                            />
                            <button
                              type="button"
                              onClick={removeLogo}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                              data-testid="button-remove-logo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                            data-testid="button-upload-logo"
                          >
                            {uploading ? (
                              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <ImageIcon className="w-5 h-5 text-muted-foreground mb-1" />
                                <span className="text-[10px] text-muted-foreground">PNG</span>
                              </>
                            )}
                          </div>
                        )}
                        <div className="flex-1">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png"
                            onChange={handleLogoUpload}
                            className="hidden"
                            data-testid="input-logo-file"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="gap-2"
                            data-testid="button-choose-logo"
                          >
                            <Upload className="w-3 h-3" />
                            {uploading ? "Uploading..." : "Choose File"}
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">PNG format, max 2MB</p>
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your token's purpose..."
                              className="resize-none"
                              rows={3}
                              data-testid="input-description"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" data-testid="input-contact-email" {...field} />
                          </FormControl>
                          <FormDescription>We'll send updates to this email</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full gap-2"
                      disabled={createMutation.isPending}
                      data-testid="button-submit-create"
                    >
                      {createMutation.isPending ? "Creating..." : "Create Token & Continue to Payment"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="text-preview-title">
                  <Code className="w-5 h-5 text-primary" /> Smart Contract Preview
                </CardTitle>
                <CardDescription>Auto-generated Solidity contract</CardDescription>
              </CardHeader>
              <CardContent>
                <SolidityPreview
                  name={watchName}
                  symbol={watchSymbol}
                  supply={watchSupply}
                  decimals={watchDecimals}
                />
                <p className="text-xs text-muted-foreground mt-4">
                  This ERC-20 contract is auto-generated based on your inputs. It will be deployed to the Sepolia testnet after payment confirmation.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

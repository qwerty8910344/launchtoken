'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/lib/theme";
import { Plus, LogOut, Sun, Moon, Layers, Wallet, Star, Clock, Shield, DollarSign, CheckCircle, TrendingUp, FileText, Search, Settings, Megaphone, BarChart3, Zap, FileDown, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import type { Token, ExchangeListing } from "@shared/schema";
const logoImg = '/logo-optimized.webp';

function getStatusBadge(status: string | null) {
  switch (status) {
    case "confirmed":
      return <Badge data-testid="badge-confirmed">Approved</Badge>;
    case "awaiting_confirmation":
      return <Badge variant="secondary" data-testid="badge-awaiting"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    case "rejected":
      return <Badge variant="destructive" data-testid="badge-rejected">Rejected</Badge>;
    default:
      return <Badge variant="secondary" data-testid="badge-pending">Unpaid</Badge>;
  }
}

function TokenCard({ token, index }: { token: Token; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="hover-elevate">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
          <div className="flex items-center gap-3">
            <img src={token.logoUrl || logoImg} alt="Token" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            <div>
              <CardTitle className="text-base" data-testid={`text-token-name-${token.id}`}>{token.tokenName}</CardTitle>
              <p className="text-sm text-muted-foreground" data-testid={`text-token-symbol-${token.id}`}>{token.tokenSymbol}</p>
            </div>
          </div>
          {getStatusBadge(token.paymentStatus)}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Supply</span>
              <span className="font-mono" data-testid={`text-supply-${token.id}`}>
                {Number(token.totalSupply).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Decimals</span>
              <span className="font-mono">{token.decimals}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Submitted</span>
              <span className="text-xs">{token.createdAt ? new Date(token.createdAt).toLocaleDateString() : "N/A"}</span>
            </div>
          </div>
          <div className="mt-4 flex gap-2 flex-wrap">
            {token.paymentStatus === "pending" ? (
              <Link href={`/payment/${token.id}`}>
                <Button size="sm" className="w-full gap-2" data-testid={`button-pay-${token.id}`}>
                  <DollarSign className="w-3 h-3" /> Pay Gas Fee
                </Button>
              </Link>
            ) : (
              <Link href={`/tokens/${token.id}`}>
                <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-${token.id}`}>
                  View Details
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ExchangeTable({ listings, approvedToken }: { listings: ExchangeListing[]; approvedToken?: Token }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" data-testid="table-exchanges">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Exchange</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rating</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Est. Listing Time</th>
            <th className="text-right py-3 px-4 font-medium text-muted-foreground">Listing Fee</th>
            {approvedToken && (
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">Action</th>
            )}
          </tr>
        </thead>
        <tbody>
          {listings.filter(l => l.active).map((listing, i) => (
            <motion.tr
              key={listing.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="border-b border-border/50"
              data-testid={`row-exchange-${listing.id}`}
            >
              <td className="py-3 px-4 font-medium">{listing.exchangeName}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-primary fill-primary" />
                  <span>{listing.rating ? listing.rating.toFixed(1) : "N/A"}</span>
                  <span className="text-muted-foreground">/5</span>
                </div>
              </td>
              <td className="py-3 px-4 text-muted-foreground">{listing.estimatedListingDays} days</td>
              <td className="py-3 px-4 text-right font-mono text-primary">{listing.listingFee >= 1000 ? `${(listing.listingFee / 1000).toFixed(listing.listingFee % 1000 === 0 ? 0 : 1)}K` : listing.listingFee} USDT</td>
              {approvedToken && (
                <td className="py-3 px-4 text-right">
                  <Link href={`/listing-payment/${approvedToken.id}/${listing.id}`}>
                    <Button size="sm" variant="outline" className="gap-1 text-xs" data-testid={`button-pay-listing-${listing.id}`}>
                      <DollarSign className="w-3 h-3" /> Pay
                    </Button>
                  </Link>
                </td>
              )}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Layers className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2" data-testid="text-empty-title">No Tokens Yet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Create your first blockchain token to get started. It only takes a minute.
      </p>
      <Link href="/create-token">
        <Button className="gap-2" data-testid="button-create-first">
          <Plus className="w-4 h-4" /> Create Your First Token
        </Button>
      </Link>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const { data: tokens, isLoading } = useQuery<Token[]>({
    queryKey: ["/api/tokens"],
  });

  const { data: listings } = useQuery<ExchangeListing[]>({
    queryKey: ["/api/exchange-listings"],
  });

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/dashboard">
            <div className="flex items-center gap-2 cursor-pointer">
              <img src={logoImg} alt="LaunchToken" className="w-8 h-8 rounded-md object-cover" />
              <span className="font-bold text-lg" data-testid="text-brand-dash">LaunchToken</span>
            </div>
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="icon" variant="ghost" onClick={toggleTheme} data-testid="button-theme-toggle">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Link href="/crypto">
              <Button variant="outline" size="sm" className="gap-1" data-testid="button-crypto">
                <Coins className="w-3 h-3" /> Market Top Gainer Coins
              </Button>
            </Link>
            {user?.isAdmin && (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="gap-1" data-testid="button-admin">
                  <Shield className="w-3 h-3" /> Admin
                </Button>
              </Link>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-card border border-card-border">
              <Wallet className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm font-medium" data-testid="text-username">{user?.username}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        <section>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-dash-title">Token Dashboard</h1>
              <p className="text-muted-foreground text-sm">Manage your created tokens</p>
            </div>
            <Link href="/create-token">
              <Button className="gap-2" data-testid="button-create-token">
                <Plus className="w-4 h-4" /> Create Token
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : tokens && tokens.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tokens.map((token, i) => (
                <TokenCard key={token.id} token={token} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </section>

        {tokens && tokens.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2" data-testid="text-bonus-title">
                <TrendingUp className="w-5 h-5 text-primary" /> Listing Bonus
              </h2>
              <p className="text-muted-foreground text-sm">Increase your chances of getting listed on major exchanges</p>
            </div>
            <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary" data-testid="text-bonus-percent">77%</div>
                      <div className="text-xs text-muted-foreground">Higher Chance</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm" data-testid="text-bonus-desc">
                      Projects that create <span className="font-bold text-primary">more than 20 tokens or meme coins</span> have a{" "}
                      <span className="font-bold text-primary">77% increased chance</span> of getting listed on major exchanges.
                      More tokens demonstrate project commitment, active development, and ecosystem growth — key factors exchanges look for.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="secondary" data-testid="text-token-count">
                        Your tokens: {tokens.length} / 20
                      </Badge>
                      {tokens.length > 20 ? (
                        <Badge data-testid="badge-bonus-active">Bonus Active</Badge>
                      ) : (
                        <Badge variant="outline" data-testid="badge-bonus-inactive">
                          {20 - tokens.length} more to unlock
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2" data-testid="text-behalf-title">
              <CheckCircle className="w-5 h-5 text-primary" /> What We Do On Your Behalf
            </h2>
            <p className="text-muted-foreground text-sm">Our team handles the entire exchange listing process for you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: FileText, title: "Project Preparation", desc: "We prepare your project documentation, whitepaper, tokenomics, and all required materials for exchange submission." },
              { icon: Search, title: "Submit Applications", desc: "We submit listing applications to exchanges like Binance, Coinbase, Kraken, and others on your behalf with all required details." },
              { icon: Shield, title: "Due Diligence Support", desc: "We handle the due diligence review process including legality checks, technology verification, and security audits." },
              { icon: Settings, title: "Technical Integration", desc: "We manage the full technical integration — wallet setup, node configuration, deposit/withdrawal testing, and blockchain compatibility." },
              { icon: BarChart3, title: "Liquidity & Market Making", desc: "We arrange market makers, trading pairs (USDT, BTC), and liquidity pools to ensure smooth trading on launch." },
              { icon: Megaphone, title: "Launch & Announcement", desc: "We coordinate the official listing announcement, trading pair launch, and ensure deposits and withdrawals are live." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <Card className="h-full" data-testid={`card-behalf-${i}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2" data-testid="text-procedure-title">
              <FileText className="w-5 h-5 text-primary" /> Exchange Listing Procedure
            </h2>
            <p className="text-muted-foreground text-sm">How the listing process works from start to finish</p>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {[
                  { step: "1", title: "Project Preparation", desc: "Working blockchain/token contract, website, whitepaper, tokenomics, GitHub repository, community channels, liquidity plan, and security audit." },
                  { step: "2", title: "Submit Listing Application", desc: "Apply through exchange listing pages (Binance, Coinbase, Kraken etc.) with project details, founder info, token contract, supply, use case, and legal documents." },
                  { step: "3", title: "Due Diligence Review", desc: "Exchange team reviews legality, technology, security, team background, and market demand. May request smart contract audit, KYC, and financial records. Takes 2 weeks to several months." },
                  { step: "4", title: "Technical Integration", desc: "If approved: exchange integrates token wallet, sets up nodes, tests deposits/withdrawals, and verifies blockchain compatibility." },
                  { step: "5", title: "Liquidity & Market Making", desc: "Projects must provide liquidity through market makers, trading pairs (USDT, BTC), and liquidity pools." },
                  { step: "6", title: "Listing Fee", desc: "Token creation requires a one-time 59 USDT gas fee. Exchange listing fees are separate: Tier-1 (Binance, Coinbase, Bybit): 50K-100K USDT. Mid-tier: 5K-50K USDT. Small exchanges: from 2K USDT. Listing fees cover application, technical integration, and market making." },
                  { step: "7", title: "Announcement & Launch", desc: "Exchange publishes official listing announcement, opens deposits, activates trading pairs, and enables withdrawals." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4" data-testid={`step-${item.step}`}>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{item.step}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-md bg-muted/50 border border-border">
                <h4 className="text-sm font-semibold mb-2">Typical Exchange Review Timeline</h4>
                <p className="text-xs text-muted-foreground mb-3">How long exchanges typically take to review and approve listings (independent of our service processing time):</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { type: "DEX (Uniswap)", time: "1-7 Days" },
                    { type: "Small CEX", time: "1-3 Months" },
                    { type: "Mid Exchange", time: "3-6 Months" },
                    { type: "Tier-1 Exchange", time: "6-12 Months" },
                  ].map((t) => (
                    <div key={t.type} className="text-center p-2 rounded bg-background border border-border">
                      <div className="text-xs text-muted-foreground">{t.type}</div>
                      <div className="text-sm font-semibold mt-1">{t.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {listings && listings.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold" data-testid="text-exchange-title">Available Exchange Listings</h2>
              <p className="text-muted-foreground text-sm">
                {tokens?.some(t => t.paymentStatus === "confirmed")
                  ? "Your gas fee is approved! Select an exchange and pay the listing fee to get listed."
                  : "Explore exchange options for your token after gas fee approval"}
              </p>
            </div>
            <Card>
              <CardContent className="p-0">
                <ExchangeTable listings={listings} approvedToken={tokens?.find(t => t.paymentStatus === "confirmed")} />
              </CardContent>
            </Card>
            <div className="mt-4 p-4 rounded-md bg-muted/50 border border-border">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground" data-testid="text-listing-rules">
                  Token creation gas fee: 59 USDT (one-time). Exchange listing fees are separate and vary by exchange.
                  Tier-1 exchanges (Binance, Coinbase, Bybit, Kraken) require minimum 12 months and listing fees of 50K-100K USDT.
                  Mid-tier exchanges range from 5K-50K USDT. Small exchanges start from 2K USDT depending on demand.
                  Listing fees cover application processing, technical integration, liquidity setup, and market making coordination.
                  Exchange listings are not guaranteed and depend on project quality, community size, and market conditions.
                </p>
              </div>
            </div>
          </motion.section>
        )}
      </main>

      <section className="max-w-6xl mx-auto px-4 mt-8">
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileDown className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold" data-testid="text-whitepaper-cta">Web3.0 Whitepaper</h3>
                <p className="text-sm text-muted-foreground">Learn about our platform, tokenomics, and roadmap</p>
              </div>
            </div>
            <a href="/LaunchToken_Whitepaper.pdf" download>
              <Button variant="outline" className="gap-2" data-testid="button-download-whitepaper">
                <FileDown className="w-4 h-4" />
                Download PDF
              </Button>
            </a>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-border py-4 px-4 mt-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground/60" style={{ fontSize: "9px", lineHeight: "1.4" }}>
            This platform is for educational and testing purposes only. No financial promises or investment advice. All tokens are deployed on testnet networks and have no real monetary value.
          </p>
        </div>
      </footer>
    </div>
  );
}

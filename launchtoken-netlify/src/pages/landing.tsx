import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { Zap, Shield, Rocket, ArrowRight, ChevronDown, Coins, FileDown, TrendingUp, TrendingDown, Gem, Flame, Cpu, Gamepad2, Landmark, Layers } from "lucide-react";
import { motion } from "framer-motion";
import logoImg from "@assets/logo-optimized.webp";
import { useCoins, type Coin } from "@/lib/useCoin";

function AnimatedToken() {
  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64">
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/20 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-4 rounded-full bg-primary/10 blur-xl"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <img src={logoImg} alt="LaunchToken" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(34,197,94,0.4)]" />
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, delay }: { icon: any; title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="p-6 rounded-md bg-card border border-card-border"
    >
      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2" data-testid={`text-feature-${title.toLowerCase().replace(/\s/g, '-')}`}>{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

function StepCard({ number, title, description, delay }: { number: string; title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex gap-4 items-start"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </motion.div>
  );
}

function TopGainerCoins() {
  const { data: coins, isLoading } = useCoins();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 15 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (!coins || coins.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="table-home-crypto">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground w-12">#</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Coin</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Price</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Market Cap</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">24h Change</th>
              </tr>
            </thead>
            <tbody>
              {coins.map((coin, i) => {
                const isPositive = coin.price_change_percentage_24h > 0;
                const changeColor = isPositive ? "text-green-500" : "text-red-500";
                return (
                  <tr
                    key={coin.id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => setLocation(`/crypto/${coin.id}`)}
                    data-testid={`row-home-coin-${coin.id}`}
                  >
                    <td className="py-3 px-4 text-muted-foreground">{coin.market_cap_rank}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img loading="lazy" src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                        <div>
                          <span className="font-medium">{coin.name}</span>
                          <span className="text-muted-foreground ml-2 text-xs uppercase">{coin.symbol}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      ${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                      ${coin.market_cap?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-flex items-center gap-1 font-mono ${changeColor}`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {coin.price_change_percentage_24h?.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <img src={logoImg} alt="LaunchToken" className="w-8 h-8 rounded-md object-cover" />
              <span className="font-bold text-lg" data-testid="text-brand">LaunchToken</span>
            </div>
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <a href="#top-gainers">
              <Button variant="default" className="gap-1 bg-primary text-primary-foreground font-semibold" data-testid="button-crypto-landing">
                <TrendingUp className="w-3.5 h-3.5" /> Market Top Gainer Coins
              </Button>
            </a>
            {user ? (
              <Link href="/dashboard">
                <Button data-testid="button-go-dashboard">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" data-testid="button-login">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button data-testid="button-register">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-12 md:pb-20 px-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 md:mb-6">
              <Zap className="w-3 h-3" />
              Ethereum Sepolia Testnet
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6" data-testid="text-hero-title">
              Create Your Own{" "}
              <span className="text-primary">Blockchain Token</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-lg mx-auto lg:mx-0" data-testid="text-hero-subtitle">
              Launch and test your own crypto token instantly. No coding required. Perfect for learning and experimentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href={user ? "/dashboard" : "/register"}>
                <Button size="lg" className="gap-2 w-full sm:w-auto" data-testid="button-launch-token">
                  Launch Your Token <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto" data-testid="button-learn-more">
                  How It Works <ChevronDown className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </motion.div>
          <motion.div
            className="flex-shrink-0 hidden md:block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <AnimatedToken />
          </motion.div>
        </div>
      </section>

      <section id="top-gainers" className="py-10 md:py-20 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 md:mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium mb-3 md:mb-4">
              <TrendingUp className="w-3 h-3" />
              Live Data
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3" data-testid="text-top-gainers-title">Market Top Gainer Coins</h2>
            <p className="text-muted-foreground text-sm md:text-base">Top 500 cryptocurrencies by market cap — tap any coin for details</p>
          </motion.div>
          <TopGainerCoins />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 md:mt-12"
          >
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-center" data-testid="text-discover-title">Discover Trending Categories</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { label: "Next 100x Altcoins", href: "/crypto/next-100x-altcoins", icon: Rocket, color: "text-orange-500", bg: "bg-orange-500/10" },
                { label: "AI Coins", href: "/crypto/next-100x-ai-coins", icon: Cpu, color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Gaming Coins", href: "/crypto/next-100x-gaming-coins", icon: Gamepad2, color: "text-purple-500", bg: "bg-purple-500/10" },
                { label: "DeFi Coins", href: "/crypto/next-100x-defi-coins", icon: Landmark, color: "text-green-500", bg: "bg-green-500/10" },
                { label: "Layer 1 Coins", href: "/crypto/next-100x-layer1-coins", icon: Layers, color: "text-yellow-500", bg: "bg-yellow-500/10" },
                { label: "Hidden Gems", href: "/crypto/hidden-gems", icon: Gem, color: "text-pink-500", bg: "bg-pink-500/10" },
                { label: "Biggest Movers", href: "/crypto/biggest-movers", icon: Flame, color: "text-red-500", bg: "bg-red-500/10" },
                { label: "All 500 Coins", href: "/crypto", icon: Coins, color: "text-primary", bg: "bg-primary/10" },
              ].map((cat) => (
                <Link key={cat.href} href={cat.href}>
                  <Card className="cursor-pointer hover:bg-muted/30 transition-colors border-border/50" data-testid={`card-category-${cat.href.split('/').pop()}`}>
                    <CardContent className="p-3 md:p-4 flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-md ${cat.bg} flex items-center justify-center flex-shrink-0`}>
                        <cat.icon className={`w-4 h-4 ${cat.color}`} />
                      </div>
                      <span className="font-medium text-sm">{cat.label}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-3" data-testid="text-how-title">How It Works</h2>
            <p className="text-muted-foreground">Create and deploy your token in four simple steps</p>
          </motion.div>
          <div className="space-y-8">
            <StepCard number="1" title="Create an Account" description="Sign up with your username and email to get started." delay={0.1} />
            <StepCard number="2" title="Enter Token Details" description="Choose your token name, symbol, supply, and decimals." delay={0.2} />
            <StepCard number="3" title="Connect Your Wallet" description="Connect MetaMask to deploy on Ethereum's Sepolia testnet." delay={0.3} />
            <StepCard number="4" title="Deploy & Manage" description="Deploy your token and track it on your personal dashboard." delay={0.4} />
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-3" data-testid="text-features-title">Features</h2>
            <p className="text-muted-foreground">Everything you need to create and manage tokens</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={Coins} title="Token Creator" description="Create ERC-20 tokens with custom name, symbol, supply, and decimals." delay={0.1} />
            <FeatureCard icon={Rocket} title="One-Click Deploy" description="Deploy your smart contract to the Sepolia testnet with MetaMask." delay={0.2} />
            <FeatureCard icon={Shield} title="Secure & Safe" description="Your tokens are deployed on a testnet for safe learning and experimentation." delay={0.3} />
            <FeatureCard icon={Zap} title="Gas Estimator" description="See estimated gas fees before deploying your contract." delay={0.4} />
            <FeatureCard icon={ArrowRight} title="Smart Contract Code" description="View and download the auto-generated Solidity smart contract." delay={0.5} />
            <FeatureCard icon={Coins} title="Token Dashboard" description="Track all your created tokens, contract addresses, and balances." delay={0.6} />
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <FileDown className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2" data-testid="text-whitepaper-title">Web3.0 Whitepaper</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Read our official investor whitepaper to learn about the LaunchToken platform, tokenomics, roadmap, and ecosystem.
            </p>
            <a href="/LaunchToken_Whitepaper.pdf" download>
              <Button size="lg" className="gap-2" data-testid="button-download-whitepaper">
                <FileDown className="w-4 h-4" />
                Download Whitepaper (PDF)
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 bg-card/50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Shield className="w-6 h-6 text-primary mx-auto mb-3" />
            <h2 className="text-sm font-semibold mb-2 text-muted-foreground" data-testid="text-disclaimer-title">Security & Disclaimer</h2>
            <p className="text-muted-foreground/60" style={{ fontSize: "9px", lineHeight: "1.4" }}>
              This platform is for educational and testing purposes only. No financial promises or investment advice.
              All tokens are deployed on testnet networks and have no real monetary value.
            </p>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="LaunchToken" className="w-6 h-6 rounded-md object-cover" />
            <span className="font-semibold text-sm">LaunchToken</span>
          </div>
          <p className="text-muted-foreground/60" style={{ fontSize: "9px", lineHeight: "1.4" }}>This platform is for educational and testing purposes only. No financial promises or investment advice. All tokens are deployed on testnet networks and have no real monetary value.</p>
        </div>
      </footer>
    </div>
  );
}

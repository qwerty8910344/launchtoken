import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, Gem, Rocket, Flame, Cpu, Gamepad2, Landmark, Layers } from "lucide-react";
import { motion } from "framer-motion";
import logoImg from "@assets/logo-optimized.webp";
import { useCoins, useTopMovers, useHiddenGems, useNext100x, type Coin, type ScoredCoin } from "@/lib/useCoin";

function MiniCoinRow({ coin, onClick }: { coin: Coin | ScoredCoin; onClick: () => void }) {
  const isPositive = coin.price_change_percentage_24h > 0;
  return (
    <div
      className="flex items-center justify-between py-2.5 px-3 hover:bg-muted/20 rounded-md cursor-pointer transition-colors"
      onClick={onClick}
      data-testid={`mini-coin-${coin.id}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <img loading="lazy" src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full flex-shrink-0" />
        <span className="font-medium text-sm truncate">{coin.name}</span>
        <span className="text-muted-foreground text-xs uppercase flex-shrink-0">{coin.symbol}</span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="font-mono text-sm">${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
        <span className={`inline-flex items-center gap-0.5 font-mono text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {coin.price_change_percentage_24h?.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

function DiscoveryCard({ title, icon: Icon, coins, color, link, linkText }: { title: string; icon: any; coins: (Coin | ScoredCoin)[]; color: string; link: string; linkText: string }) {
  const [, setLocation] = useLocation();
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className={`w-8 h-8 rounded-md ${color} flex items-center justify-center`}>
            <Icon className="w-4 h-4" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="divide-y divide-border/50">
          {coins.slice(0, 5).map((coin) => (
            <MiniCoinRow key={coin.id} coin={coin} onClick={() => setLocation(`/crypto/${coin.id}`)} />
          ))}
        </div>
        {coins.length > 5 && (
          <Link href={link}>
            <Button variant="ghost" size="sm" className="w-full mt-2 text-primary" data-testid={`link-${link.replace(/\//g, '-')}`}>
              {linkText} →
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function CategoryLinks() {
  const categories = [
    { label: "Next 100x Altcoins", href: "/crypto/next-100x-altcoins", icon: Rocket, color: "bg-orange-500/10 text-orange-500" },
    { label: "AI Coins", href: "/crypto/next-100x-ai-coins", icon: Cpu, color: "bg-blue-500/10 text-blue-500" },
    { label: "Gaming Coins", href: "/crypto/next-100x-gaming-coins", icon: Gamepad2, color: "bg-purple-500/10 text-purple-500" },
    { label: "DeFi Coins", href: "/crypto/next-100x-defi-coins", icon: Landmark, color: "bg-green-500/10 text-green-500" },
    { label: "Layer 1 Coins", href: "/crypto/next-100x-layer1-coins", icon: Layers, color: "bg-yellow-500/10 text-yellow-500" },
    { label: "Hidden Gems", href: "/crypto/hidden-gems", icon: Gem, color: "bg-pink-500/10 text-pink-500" },
    { label: "Biggest Movers", href: "/crypto/biggest-movers", icon: Flame, color: "bg-red-500/10 text-red-500" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map((cat) => (
        <Link key={cat.href} href={cat.href}>
          <Badge variant="outline" className={`cursor-pointer py-1.5 px-3 text-sm gap-1.5 hover:bg-muted/50 transition-colors`} data-testid={`badge-${cat.href.split('/').pop()}`}>
            <cat.icon className={`w-3.5 h-3.5 ${cat.color.split(' ')[1]}`} />
            {cat.label}
          </Badge>
        </Link>
      ))}
    </div>
  );
}

export default function CryptoPage() {
  const { data: coins, isLoading, error } = useCoins();
  const { data: topMovers } = useTopMovers();
  const { data: hiddenGems } = useHiddenGems();
  const { data: next100x } = useNext100x();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back-crypto">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="LaunchToken" className="w-8 h-8 rounded-md object-cover" />
            <span className="font-bold text-lg">LaunchToken</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-crypto-title">Crypto Market</h1>
          <p className="text-muted-foreground mb-6">Live market data, trending coins, and hidden gems</p>
        </motion.div>

        <CategoryLinks />

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground" data-testid="text-crypto-error">Failed to load coin data. Please try again later.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {topMovers && topMovers.length > 0 && (
                <DiscoveryCard
                  title="Biggest Movers Today"
                  icon={Flame}
                  coins={topMovers}
                  color="bg-red-500/10 text-red-500"
                  link="/crypto/biggest-movers"
                  linkText="See all movers"
                />
              )}
              {hiddenGems && hiddenGems.length > 0 && (
                <DiscoveryCard
                  title="Hidden Gems Under $50M"
                  icon={Gem}
                  coins={hiddenGems}
                  color="bg-pink-500/10 text-pink-500"
                  link="/crypto/hidden-gems"
                  linkText="See all hidden gems"
                />
              )}
              {next100x && next100x.length > 0 && (
                <DiscoveryCard
                  title="Next 100x Altcoins"
                  icon={Rocket}
                  coins={next100x}
                  color="bg-orange-500/10 text-orange-500"
                  link="/crypto/next-100x-altcoins"
                  linkText="See full ranking"
                />
              )}
            </div>

            <h2 className="text-2xl font-bold mb-4" data-testid="text-all-coins-title">Top 500 Cryptocurrencies</h2>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="table-crypto">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground w-12">#</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Coin</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Price</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Market Cap</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">24h Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coins?.map((coin, i) => {
                        const isPositive = coin.price_change_percentage_24h > 0;
                        const changeColor = isPositive ? "text-green-500" : "text-red-500";
                        return (
                          <tr
                            key={coin.id}
                            className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                            onClick={() => setLocation(`/crypto/${coin.id}`)}
                            data-testid={`row-coin-${coin.id}`}
                          >
                            <td className="py-3 px-4 text-muted-foreground">{coin.market_cap_rank}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img loading="lazy" src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                                <div>
                                  <span className="font-medium" data-testid={`text-coin-name-${coin.id}`}>{coin.name}</span>
                                  <span className="text-muted-foreground ml-2 text-xs uppercase">{coin.symbol}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono" data-testid={`text-coin-price-${coin.id}`}>
                              ${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-muted-foreground hidden sm:table-cell" data-testid={`text-coin-mcap-${coin.id}`}>
                              ${coin.market_cap?.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`inline-flex items-center gap-1 font-mono ${changeColor}`} data-testid={`text-coin-change-${coin.id}`}>
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
          </>
        )}
      </main>
    </div>
  );
}

'use client';

import { useParams } from 'next/navigation';
import { useCoin } from "@/lib/useCoin";
import { CryptoNav, CoinSubNav } from "@/components/crypto-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Coins, PieChart } from "lucide-react";
import { motion } from "framer-motion";

export default function CryptoMarketCapPage() {
  const { coin: coinId } = useParams<{ coin: string }>();
  const { coin, isLoading } = useCoin(coinId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CryptoNav />
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="min-h-screen bg-background">
        <CryptoNav />
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Coin Not Found</h1>
        </div>
      </div>
    );
  }

  const supplyPercentage = coin.max_supply && coin.circulating_supply
    ? ((coin.circulating_supply / coin.max_supply) * 100).toFixed(1)
    : null;

  const fullyDilutedMcap = coin.max_supply
    ? coin.max_supply * coin.current_price
    : coin.total_supply
    ? coin.total_supply * coin.current_price
    : null;

  const stats = [
    { icon: BarChart3, label: "Market Cap", value: `$${coin.market_cap?.toLocaleString()}` },
    { icon: PieChart, label: "Market Cap Rank", value: `#${coin.market_cap_rank}` },
    { icon: Coins, label: "24h Volume", value: `$${coin.total_volume?.toLocaleString()}` },
    { icon: BarChart3, label: "Volume / Market Cap", value: coin.market_cap ? (coin.total_volume / coin.market_cap).toFixed(4) : "N/A" },
    { icon: Coins, label: "Circulating Supply", value: `${coin.circulating_supply?.toLocaleString()} ${coin.symbol?.toUpperCase()}` },
    { icon: Coins, label: "Total Supply", value: coin.total_supply ? `${coin.total_supply.toLocaleString()} ${coin.symbol?.toUpperCase()}` : "N/A" },
    { icon: Coins, label: "Max Supply", value: coin.max_supply ? `${coin.max_supply.toLocaleString()} ${coin.symbol?.toUpperCase()}` : "Unlimited" },
    { icon: BarChart3, label: "Fully Diluted Market Cap", value: fullyDilutedMcap ? `$${fullyDilutedMcap.toLocaleString()}` : "N/A" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <CryptoNav coin={coin} />
      <CoinSubNav coinId={coinId} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-mcap-title">
            {coin.name} Market Cap
          </h1>
          <p className="text-muted-foreground mb-8">
            {coin.name} market capitalization and circulating supply statistics.
          </p>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <img loading="lazy" src={coin.image} alt={coin.name} className="w-12 h-12 rounded-full" />
                <div>
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="text-3xl font-mono font-bold" data-testid="text-market-cap-value">
                    ${coin.market_cap?.toLocaleString()}
                  </p>
                </div>
              </div>

              {supplyPercentage && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Supply Mined</span>
                    <span className="font-medium">{supplyPercentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${supplyPercentage}%` }}
                      data-testid="bar-supply-mined"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4 flex items-start gap-3">
                  <stat.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-mono font-medium" data-testid={`stat-${stat.label.toLowerCase().replace(/[\s/]+/g, "-")}`}>{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

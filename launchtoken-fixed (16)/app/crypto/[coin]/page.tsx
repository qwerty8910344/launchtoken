'use client';

import { useParams } from 'next/navigation';
import { useCoin, useCoins } from "@/lib/useCoin";
import { CryptoNav, CoinSubNav } from "@/components/crypto-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import CryptoComparisonPage from '@/app/crypto/comparison/page';
import CryptoCategoryPage from '@/components/crypto-category-page';

export default function CoinPage() {
  const { coin: coinId } = useParams<{ coin: string }>();

  const CATS=['next-100x-altcoins','next-100x-ai-coins','next-100x-gaming-coins','next-100x-defi-coins','next-100x-layer1-coins','hidden-gems','biggest-movers'];
  if(CATS.includes(coinId)) return <CryptoCategoryPage />;
  if (coinId.includes("-vs-")) {
    return <CryptoComparisonPage />;
  }

  const { coin, isLoading } = useCoin(coinId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CryptoNav />
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="min-h-screen bg-background">
        <CryptoNav />
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Coin Not Found</h1>
          <p className="text-muted-foreground mb-4">The cryptocurrency you're looking for doesn't exist.</p>
          <Link href="/crypto"><Button data-testid="button-back-list">Back to List</Button></Link>
        </div>
      </div>
    );
  }

  const isPositive = coin.price_change_percentage_24h > 0;

  const stats = [
    { label: "Current Price", value: `$${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` },
    { label: "Market Cap", value: `$${coin.market_cap?.toLocaleString()}` },
    { label: "24h Volume", value: `$${coin.total_volume?.toLocaleString()}` },
    { label: "24h High", value: `$${coin.high_24h?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` },
    { label: "24h Low", value: `$${coin.low_24h?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` },
    { label: "All-Time High", value: `$${coin.ath?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` },
    { label: "Circulating Supply", value: `${coin.circulating_supply?.toLocaleString()} ${coin.symbol?.toUpperCase()}` },
    { label: "Max Supply", value: coin.max_supply ? `${coin.max_supply.toLocaleString()} ${coin.symbol?.toUpperCase()}` : "Unlimited" },
    { label: "Market Cap Rank", value: `#${coin.market_cap_rank}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <CryptoNav coin={coin} />
      <CoinSubNav coinId={coinId} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-6">
            <img loading="lazy" src={coin.image} alt={coin.name} className="w-12 h-12 rounded-full" />
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-coin-title">{coin.name} ({coin.symbol?.toUpperCase()})</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-mono font-semibold" data-testid="text-coin-price">
                  ${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </span>
                <Badge variant={isPositive ? "default" : "destructive"} className="flex items-center gap-1" data-testid="badge-coin-change">
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {coin.price_change_percentage_24h?.toFixed(2)}%
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-mono font-medium mt-1" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href={`/crypto/${coinId}/price`}><Button variant="outline" className="w-full" data-testid="link-price">Price Details</Button></Link>
            <Link href={`/crypto/${coinId}/price-prediction`}><Button variant="outline" className="w-full" data-testid="link-prediction">Price Prediction</Button></Link>
            <Link href={`/crypto/${coinId}/profit-calculator`}><Button variant="outline" className="w-full" data-testid="link-calculator">Profit Calculator</Button></Link>
            <Link href={`/crypto/${coinId}/market-cap`}><Button variant="outline" className="w-full" data-testid="link-market-cap">Market Cap</Button></Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

'use client';

import { useParams } from 'next/navigation';
import { useCoin } from "@/lib/useCoin";
import { CryptoNav, CoinSubNav } from "@/components/crypto-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

export default function CryptoPricePage() {
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

  const isPositive = coin.price_change_percentage_24h > 0;
  const changeColor = isPositive ? "text-green-500" : "text-red-500";

  const priceData = [
    { label: "Current Price", value: `$${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` },
    { label: "24h Change", value: `$${Math.abs(coin.price_change_24h || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`, colored: true },
    { label: "24h Change %", value: `${coin.price_change_percentage_24h?.toFixed(2)}%`, colored: true },
    { label: "24h High", value: `$${coin.high_24h?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` },
    { label: "24h Low", value: `$${coin.low_24h?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` },
    { label: "24h Volume", value: `$${coin.total_volume?.toLocaleString()}` },
    { label: "All-Time High", value: `$${coin.ath?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` },
    { label: "ATH Change", value: `${coin.ath_change_percentage?.toFixed(2)}%` },
    { label: "All-Time Low", value: `$${coin.atl?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <CryptoNav coin={coin} />
      <CoinSubNav coinId={coinId} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-price-title">
            {coin.name} Price Today ({coin.symbol?.toUpperCase()})
          </h1>
          <p className="text-muted-foreground mb-8">
            Live {coin.name} price, chart, market cap and latest crypto data.
          </p>

          <div className="flex items-center gap-4 mb-8">
            <img loading="lazy" src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
            <span className="text-4xl font-mono font-bold" data-testid="text-live-price">
              ${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </span>
            <span className={`flex items-center gap-1 text-lg font-mono ${changeColor}`}>
              {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {coin.price_change_percentage_24h?.toFixed(2)}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {priceData.map((item) => (
              <Card key={item.label}>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className={`text-lg font-mono font-medium mt-1 ${item.colored ? changeColor : ""}`} data-testid={`stat-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>
                    {isPositive && item.colored ? "+" : ""}{item.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

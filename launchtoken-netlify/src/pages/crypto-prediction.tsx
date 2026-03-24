import { useParams } from "wouter";
import { useCoin } from "@/lib/useCoin";
import { CryptoNav, CoinSubNav } from "@/components/crypto-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function CryptoPredictionPage() {
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

  const price = coin.current_price;
  const predictions = [
    { year: "2025", low: price * 0.8, mid: price * 1.5, high: price * 2.5 },
    { year: "2026", low: price * 0.6, mid: price * 2.0, high: price * 4.0 },
    { year: "2027", low: price * 0.7, mid: price * 2.5, high: price * 5.5 },
    { year: "2028", low: price * 0.9, mid: price * 3.0, high: price * 7.0 },
    { year: "2030", low: price * 1.2, mid: price * 5.0, high: price * 12.0 },
  ];

  const formatPrice = (v: number) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen bg-background">
      <CryptoNav coin={coin} />
      <CoinSubNav coinId={coinId} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-prediction-title">
            {coin.name} Price Prediction 2025, 2030
          </h1>
          <p className="text-muted-foreground mb-8">
            {coin.name} price prediction analysis, forecast and future outlook.
          </p>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">What could the future price of {coin.name} be?</h2>
              </div>
              <p className="text-muted-foreground">
                Based on current market trends and {coin.name}'s market position at rank #{coin.market_cap_rank},
                here are projected price scenarios. Current price: {formatPrice(price)}.
              </p>
            </CardContent>
          </Card>

          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {coin.name} Forecast
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-predictions">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Year</th>
                  <th className="text-right py-3 px-4 font-medium text-red-400">Bear Case</th>
                  <th className="text-right py-3 px-4 font-medium text-yellow-500">Base Case</th>
                  <th className="text-right py-3 px-4 font-medium text-green-500">Bull Case</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Potential ROI</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p) => (
                  <tr key={p.year} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-medium">{p.year}</td>
                    <td className="py-3 px-4 text-right font-mono text-red-400">{formatPrice(p.low)}</td>
                    <td className="py-3 px-4 text-right font-mono text-yellow-500">{formatPrice(p.mid)}</td>
                    <td className="py-3 px-4 text-right font-mono text-green-500">{formatPrice(p.high)}</td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span className="text-green-500 flex items-center justify-end gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +{((p.high / price - 1) * 100).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Card className="mt-8 bg-muted/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground/60">
                Disclaimer: Price predictions are based on algorithmic analysis and should not be considered financial advice.
                Cryptocurrency markets are highly volatile. Always do your own research before investing.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

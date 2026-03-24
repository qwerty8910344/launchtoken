import { useParams } from "wouter";
import { useCoins, type Coin } from "@/lib/useCoin";
import { CryptoNav } from "@/components/crypto-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

function StatRow({ label, val1, val2 }: { label: string; val1: string; val2: string }) {
  return (
    <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
      <td className="py-3 px-4 font-medium text-muted-foreground">{label}</td>
      <td className="py-3 px-4 text-right font-mono">{val1}</td>
      <td className="py-3 px-4 text-right font-mono">{val2}</td>
    </tr>
  );
}

export default function CryptoComparisonPage() {
  const params = useParams<{ comparison?: string; coin?: string }>();
  const comparison = params.comparison || params.coin || "";
  const parts = comparison.split("-vs-");
  const coin1Id = parts[0] || "";
  const coin2Id = parts[1] || "";

  const { data: coins, isLoading } = useCoins();

  const coin1 = coins?.find((c) => c.id === coin1Id) || null;
  const coin2 = coins?.find((c) => c.id === coin2Id) || null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CryptoNav />
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!coin1 || !coin2) {
    return (
      <div className="min-h-screen bg-background">
        <CryptoNav />
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Comparison Not Found</h1>
          <p className="text-muted-foreground mb-4">One or both coins could not be found.</p>
          <Link href="/crypto"><Button data-testid="button-back-list">Back to List</Button></Link>
        </div>
      </div>
    );
  }

  const formatPrice = (v: number) => `$${v?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  const formatLarge = (v: number) => `$${v?.toLocaleString()}`;

  function CoinHeader({ coin }: { coin: Coin }) {
    const isPositive = coin.price_change_percentage_24h > 0;
    return (
      <div className="flex items-center gap-3">
        <img loading="lazy" src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
        <div>
          <h3 className="font-semibold text-lg">{coin.name}</h3>
          <div className="flex items-center gap-2">
            <span className="font-mono">{formatPrice(coin.current_price)}</span>
            <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
              {isPositive ? "+" : ""}{coin.price_change_percentage_24h?.toFixed(2)}%
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CryptoNav />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-comparison-title">
            {coin1.name} vs {coin2.name}
          </h1>
          <p className="text-muted-foreground mb-8">
            Side-by-side comparison of {coin1.name} ({coin1.symbol?.toUpperCase()}) and {coin2.name} ({coin2.symbol?.toUpperCase()}).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <CoinHeader coin={coin1} />
                <div className="mt-3">
                  <Link href={`/crypto/${coin1.id}`}>
                    <Button variant="outline" size="sm" className="w-full" data-testid="button-view-coin1">
                      View {coin1.name} <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <CoinHeader coin={coin2} />
                <div className="mt-3">
                  <Link href={`/crypto/${coin2.id}`}>
                    <Button variant="outline" size="sm" className="w-full" data-testid="button-view-coin2">
                      View {coin2.name} <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-comparison">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Metric</th>
                      <th className="text-right py-3 px-4 font-medium">
                        <span className="flex items-center justify-end gap-2">
                          <img src={coin1.image} alt="" className="w-4 h-4 rounded-full" />
                          {coin1.symbol?.toUpperCase()}
                        </span>
                      </th>
                      <th className="text-right py-3 px-4 font-medium">
                        <span className="flex items-center justify-end gap-2">
                          <img src={coin2.image} alt="" className="w-4 h-4 rounded-full" />
                          {coin2.symbol?.toUpperCase()}
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <StatRow label="Price" val1={formatPrice(coin1.current_price)} val2={formatPrice(coin2.current_price)} />
                    <StatRow label="Market Cap" val1={formatLarge(coin1.market_cap)} val2={formatLarge(coin2.market_cap)} />
                    <StatRow label="Market Cap Rank" val1={`#${coin1.market_cap_rank}`} val2={`#${coin2.market_cap_rank}`} />
                    <StatRow label="24h Volume" val1={formatLarge(coin1.total_volume)} val2={formatLarge(coin2.total_volume)} />
                    <StatRow label="24h Change" val1={`${coin1.price_change_percentage_24h?.toFixed(2)}%`} val2={`${coin2.price_change_percentage_24h?.toFixed(2)}%`} />
                    <StatRow label="24h High" val1={formatPrice(coin1.high_24h)} val2={formatPrice(coin2.high_24h)} />
                    <StatRow label="24h Low" val1={formatPrice(coin1.low_24h)} val2={formatPrice(coin2.low_24h)} />
                    <StatRow label="All-Time High" val1={formatPrice(coin1.ath)} val2={formatPrice(coin2.ath)} />
                    <StatRow label="ATH Change" val1={`${coin1.ath_change_percentage?.toFixed(2)}%`} val2={`${coin2.ath_change_percentage?.toFixed(2)}%`} />
                    <StatRow label="Circulating Supply" val1={`${coin1.circulating_supply?.toLocaleString()}`} val2={`${coin2.circulating_supply?.toLocaleString()}`} />
                    <StatRow label="Max Supply" val1={coin1.max_supply ? coin1.max_supply.toLocaleString() : "Unlimited"} val2={coin2.max_supply ? coin2.max_supply.toLocaleString() : "Unlimited"} />
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { useParams } from "wouter";
import { useCoin } from "@/lib/useCoin";
import { CryptoNav, CoinSubNav } from "@/components/crypto-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

export default function CryptoCalculatorPage() {
  const { coin: coinId } = useParams<{ coin: string }>();
  const { coin, isLoading } = useCoin(coinId);
  const [investment, setInvestment] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [result, setResult] = useState<{ profit: number; roi: number; coinsOwned: number } | null>(null);

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

  function calculate() {
    const inv = parseFloat(investment);
    const buy = parseFloat(buyPrice);
    const sell = parseFloat(sellPrice);
    if (!inv || !buy || !sell || buy === 0) return;

    const coinsOwned = inv / buy;
    const finalValue = coinsOwned * sell;
    const profit = finalValue - inv;
    const roi = ((finalValue - inv) / inv) * 100;

    setResult({ profit, roi, coinsOwned });
  }

  const isProfit = result ? result.profit >= 0 : true;

  return (
    <div className="min-h-screen bg-background">
      <CryptoNav coin={coin} />
      <CoinSubNav coinId={coinId} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-calculator-title">
            {coin.name} Profit Calculator
          </h1>
          <p className="text-muted-foreground mb-8">
            Calculate {coin.name} investment profit and ROI. Current price: ${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Investment Details</h2>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Investment Amount (USD)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 1000"
                    value={investment}
                    onChange={(e) => setInvestment(e.target.value)}
                    data-testid="input-investment"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Buy Price (USD)</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="e.g. 50000"
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(e.target.value)}
                      data-testid="input-buy-price"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBuyPrice(String(coin.current_price))}
                      data-testid="button-use-current"
                    >
                      Current
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Sell Price (USD)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 100000"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    data-testid="input-sell-price"
                  />
                </div>

                <Button onClick={calculate} className="w-full" data-testid="button-calculate">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Calculate Profit
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {result && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <Card className={isProfit ? "border-green-500/30" : "border-red-500/30"}>
                    <CardContent className="p-6 space-y-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        {isProfit ? <TrendingUp className="w-5 h-5 text-green-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
                        Results
                      </h2>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{coin.symbol?.toUpperCase()} Owned</span>
                          <span className="font-mono font-medium" data-testid="text-coins-owned">{result.coinsOwned.toLocaleString(undefined, { maximumFractionDigits: 8 })}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Initial Investment</span>
                          <span className="font-mono" data-testid="text-investment">${parseFloat(investment).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Final Value</span>
                          <span className="font-mono" data-testid="text-final-value">${(result.coinsOwned * parseFloat(sellPrice)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="border-t border-border pt-3 flex justify-between items-center">
                          <span className="font-semibold">{isProfit ? "Profit" : "Loss"}</span>
                          <span className={`text-xl font-mono font-bold ${isProfit ? "text-green-500" : "text-red-500"}`} data-testid="text-profit">
                            {isProfit ? "+" : ""}${result.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">ROI</span>
                          <span className={`font-mono font-medium ${isProfit ? "text-green-500" : "text-red-500"}`} data-testid="text-roi">
                            {isProfit ? "+" : ""}{result.roi.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {!result && (
                <Card className="bg-muted/30">
                  <CardContent className="p-6 text-center">
                    <Calculator className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground">Enter your investment details and click calculate to see your potential profit.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

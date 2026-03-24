'use client';

import { useEffect } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, TrendingUp, TrendingDown, Gem, Rocket, Flame, Cpu, Gamepad2, Landmark, Layers } from "lucide-react";
import { motion } from "framer-motion";
const logoImg = '/logo-optimized.webp';
import {
  useScoredCoins,
  useTopMovers,
  useHiddenGems,
  useNext100x,
  useCoinsByCategory,
  CATEGORY_META,
  type ScoredCoin,
} from "@/lib/useCoin";

const CATEGORY_ICONS: Record<string, any> = {
  "next-100x-altcoins": Rocket,
  "next-100x-ai-coins": Cpu,
  "next-100x-gaming-coins": Gamepad2,
  "next-100x-defi-coins": Landmark,
  "next-100x-layer1-coins": Layers,
  "hidden-gems": Gem,
  "biggest-movers": Flame,
};

const CATEGORY_COLORS: Record<string, string> = {
  "next-100x-altcoins": "bg-orange-500/10 text-orange-500",
  "next-100x-ai-coins": "bg-blue-500/10 text-blue-500",
  "next-100x-gaming-coins": "bg-purple-500/10 text-purple-500",
  "next-100x-defi-coins": "bg-green-500/10 text-green-500",
  "next-100x-layer1-coins": "bg-yellow-500/10 text-yellow-500",
  "hidden-gems": "bg-pink-500/10 text-pink-500",
  "biggest-movers": "bg-red-500/10 text-red-500",
};

function useCategoryCoins(slug: string): { data: ScoredCoin[]; isLoading: boolean; error: any } {
  const scored = useScoredCoins();
  const movers = useTopMovers();
  const gems = useHiddenGems();
  const next = useNext100x();
  const ai = useCoinsByCategory("AI");
  const gaming = useCoinsByCategory("Gaming");
  const defi = useCoinsByCategory("DeFi");
  const layer1 = useCoinsByCategory("Layer 1");

  switch (slug) {
    case "biggest-movers":
      return movers;
    case "hidden-gems":
      return gems;
    case "next-100x-altcoins":
      return next;
    case "next-100x-ai-coins":
      return ai;
    case "next-100x-gaming-coins":
      return gaming;
    case "next-100x-defi-coins":
      return defi;
    case "next-100x-layer1-coins":
      return layer1;
    default:
      return scored;
  }
}

function RelatedPages({ current }: { current: string }) {
  const pages = Object.entries(CATEGORY_META).filter(([slug]) => slug !== current);
  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">Explore More</h2>
      <div className="flex flex-wrap gap-2">
        {pages.map(([slug, meta]) => {
          const Icon = CATEGORY_ICONS[slug] || Rocket;
          return (
            <Link key={slug} href={`/crypto/${slug}`}>
              <Badge variant="outline" className="cursor-pointer py-1.5 px-3 text-sm gap-1.5 hover:bg-muted/50 transition-colors" data-testid={`link-related-${slug}`}>
                <Icon className="w-3.5 h-3.5" />
                {meta.h1}
              </Badge>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function CryptoCategoryPage() {
  const router = useRouter();
  const slug = location.replace("/crypto/", "");
  const meta = CATEGORY_META[slug];
  const { data: coins, isLoading, error } = useCategoryCoins(slug);
  const Icon = CATEGORY_ICONS[slug] || Rocket;
  const color = CATEGORY_COLORS[slug] || "bg-primary/10 text-primary";

  useEffect(() => {
    if (meta) {
      document.title = meta.title;
      const pageUrl = `https://launchtoken.online/crypto/${slug}`;

      function setOrCreateMeta(name: string, content: string, isProperty = false) {
        const attr = isProperty ? "property" : "name";
        let el = document.querySelector(`meta[${attr}="${name}"]`);
        if (el) {
          el.setAttribute("content", content);
        } else {
          el = document.createElement("meta");
          el.setAttribute(attr, name);
          el.setAttribute("content", content);
          document.head.appendChild(el);
        }
      }

      setOrCreateMeta("description", meta.description);
      setOrCreateMeta("og:title", meta.title, true);
      setOrCreateMeta("og:description", meta.description, true);
      setOrCreateMeta("og:url", pageUrl, true);
      setOrCreateMeta("og:type", "website", true);
      setOrCreateMeta("twitter:card", "summary");
      setOrCreateMeta("twitter:title", meta.title);
      setOrCreateMeta("twitter:description", meta.description);

      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (canonical) {
        canonical.href = pageUrl;
      } else {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        canonical.href = pageUrl;
        document.head.appendChild(canonical);
      }
    }
  }, [meta, slug]);

  if (!meta) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/crypto">
            <Button variant="ghost" size="icon" data-testid="button-back-category">
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
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold" data-testid="text-category-title">{meta.h1}</h1>
          </div>
          <p className="text-muted-foreground mb-8 max-w-2xl">{meta.description}</p>
        </motion.div>

        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span>Scored by: Volume Growth (30%) + Market Cap Potential (30%) + Price Momentum (20%) + ATH Distance (20%)</span>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground" data-testid="text-category-error">Failed to load coin data. Please try again later.</p>
            </CardContent>
          </Card>
        ) : coins && coins.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-category-coins">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground w-12">#</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Coin</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Price</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Market Cap</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Volume</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">24h</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coins.map((coin, i) => {
                      const isPositive = coin.price_change_percentage_24h > 0;
                      const changeColor = isPositive ? "text-green-500" : "text-red-500";
                      const score = "score" in coin ? (coin as ScoredCoin).score : 0;
                      return (
                        <tr
                          key={coin.id}
                          className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                          onClick={() => router.push(`/crypto/${coin.id}`)}
                          data-testid={`row-category-coin-${coin.id}`}
                        >
                          <td className="py-3 px-4 text-muted-foreground">{i + 1}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img loading="lazy" src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{coin.name}</span>
                                <span className="text-muted-foreground text-xs uppercase">{coin.symbol}</span>
                                {"category" in coin && (coin as ScoredCoin).category?.map((cat) => (
                                  <Badge key={cat} variant="secondary" className="text-[10px] px-1.5 py-0 hidden lg:inline-flex">{cat}</Badge>
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono">
                            ${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-muted-foreground hidden sm:table-cell">
                            ${coin.market_cap?.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-muted-foreground hidden sm:table-cell">
                            ${coin.total_volume?.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`inline-flex items-center gap-1 font-mono ${changeColor}`}>
                              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {coin.price_change_percentage_24h?.toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-muted-foreground hidden md:table-cell">
                            {score > 0 ? score.toFixed(1) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No coins found in this category.</p>
            </CardContent>
          </Card>
        )}

        <RelatedPages current={slug} />
      </main>
    </div>
  );
}

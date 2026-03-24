'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
const logoImg = '/logo-optimized.webp';
import type { Coin } from "@/lib/useCoin";

export function CryptoNav({ coin }: { coin?: Coin | null }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link href="/crypto">
          <Button variant="ghost" size="icon" data-testid="button-back-crypto">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="LaunchToken" className="w-8 h-8 rounded-md object-cover" />
          <span className="font-bold text-lg">LaunchToken</span>
        </div>
        {coin && (
          <div className="flex items-center gap-2 ml-auto">
            <img loading="lazy" src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
            <span className="font-medium">{coin.name}</span>
            <span className="text-muted-foreground text-xs uppercase">({coin.symbol})</span>
          </div>
        )}
      </div>
    </nav>
  );
}

export function CoinSubNav({ coinId }: { coinId: string }) {
  const pathname = usePathname();
  const tabs = [
    { path: `/crypto/${coinId}`, label: "Overview" },
    { path: `/crypto/${coinId}/price`, label: "Price" },
    { path: `/crypto/${coinId}/price-prediction`, label: "Prediction" },
    { path: `/crypto/${coinId}/profit-calculator`, label: "Calculator" },
    { path: `/crypto/${coinId}/market-cap`, label: "Market Cap" },
  ];
  return (
    <div className="border-b border-border bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <Link key={tab.path} href={tab.path}>
              <button
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`tab-${tab.label.toLowerCase().replace(" ", "-")}`}
              >
                {tab.label}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

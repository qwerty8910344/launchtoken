import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_date: string;
}

export interface ScoredCoin extends Coin {
  score: number;
  category?: string[];
}

const AI_COINS = new Set(["render-token", "fetch-ai", "ocean-protocol", "singularitynet", "akash-network", "bittensor", "worldcoin", "artificial-superintelligence-alliance", "near", "internet-computer", "injective-protocol", "theta-token", "ai-rig-complex", "nosana", "phala-network", "arkham", "numeraire", "cortex", "graphlinq-protocol", "oraichain-token", "skyai", "vana"]);
const GAMING_COINS = new Set(["the-sandbox", "axie-infinity", "decentraland", "gala", "immutable-x", "enjincoin", "illuvium", "stepn", "yield-guild-games", "ronin", "magic", "beam-2", "pixels", "prime-2", "vulcan-forged", "star-atlas", "ultra", "yooldo-games", "peanut-the-squirrel", "catizen"]);
const DEFI_COINS = new Set(["uniswap", "aave", "maker", "lido-dao", "curve-dao-token", "compound-governance-token", "sushi", "pancakeswap-token", "1inch", "yearn-finance", "dydx", "synthetix-network-token", "balancer", "frax", "ribbon-finance", "convex-finance", "raydium", "jupiter-exchange-solana", "orca", "kamino", "marinade"]);
const LAYER1_COINS = new Set(["bitcoin", "ethereum", "solana", "cardano", "avalanche-2", "polkadot", "cosmos", "tron", "near", "algorand", "aptos", "sui", "sei-network", "celestia", "fantom", "flow", "hedera-hashgraph", "internet-computer", "tezos", "celo", "zilliqa", "harmony", "elrond-erd-2", "kaspa", "quai-network"]);

export function getCoinCategories(coinId: string): string[] {
  const cats: string[] = [];
  if (AI_COINS.has(coinId)) cats.push("AI");
  if (GAMING_COINS.has(coinId)) cats.push("Gaming");
  if (DEFI_COINS.has(coinId)) cats.push("DeFi");
  if (LAYER1_COINS.has(coinId)) cats.push("Layer 1");
  return cats;
}

export function calculateScore(coin: Coin): number {
  if (!coin.market_cap || coin.market_cap <= 0) return 0;
  const volumeSignal = Math.min((coin.total_volume || 0) / coin.market_cap, 2) / 2;
  const mcapSignal = Math.min(1000000000 / coin.market_cap, 10) / 10;
  const momentumSignal = (Math.max(Math.min(coin.price_change_percentage_24h || 0, 50), -50) + 50) / 100;
  const athPercent = coin.ath_change_percentage || 0;
  const athSignal = athPercent < 0 ? Math.min(Math.abs(athPercent) / 100, 1) : 0;

  return (
    volumeSignal * 30 +
    mcapSignal * 30 +
    momentumSignal * 20 +
    athSignal * 20
  );
}

export function useCoins() {
  return useQuery<Coin[]>({
    queryKey: ["/api/coins"],
    staleTime: 60000,
  });
}

export function useCoin(coinId: string) {
  const { data: coins, isLoading, error } = useCoins();
  const coin = coins?.find((c) => c.id === coinId) || null;
  return { coin, isLoading, error, coins };
}

export function useScoredCoins() {
  const { data: coins, isLoading, error } = useCoins();
  const scored = useMemo(() => {
    if (!coins) return [];
    return coins.map((c) => ({
      ...c,
      score: calculateScore(c),
      category: getCoinCategories(c.id),
    })).sort((a, b) => b.score - a.score);
  }, [coins]);
  return { data: scored, isLoading, error };
}

export function useTopMovers() {
  const { data: coins, isLoading, error } = useCoins();
  const movers = useMemo((): ScoredCoin[] => {
    if (!coins) return [];
    return [...coins]
      .filter((c) => c.price_change_percentage_24h != null)
      .sort((a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h))
      .slice(0, 20)
      .map((c) => ({ ...c, score: calculateScore(c), category: getCoinCategories(c.id) }));
  }, [coins]);
  return { data: movers, isLoading, error };
}

export function useHiddenGems() {
  const { data: scored, isLoading, error } = useScoredCoins();
  const gems = useMemo(() => {
    return scored
      .filter((c) => c.market_cap < 50000000 && c.market_cap > 1000000)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
  }, [scored]);
  return { data: gems, isLoading, error };
}

export function useNext100x() {
  const { data: scored, isLoading, error } = useScoredCoins();
  const next = useMemo(() => {
    return scored
      .filter((c) => c.market_cap < 500000000)
      .slice(0, 100);
  }, [scored]);
  return { data: next, isLoading, error };
}

export function useCoinsByCategory(category: string) {
  const { data: scored, isLoading, error } = useScoredCoins();
  const filtered = useMemo(() => {
    return scored.filter((c) => c.category?.includes(category));
  }, [scored, category]);
  return { data: filtered, isLoading, error };
}

export type CryptoCategory = "all" | "ai" | "gaming" | "defi" | "layer1" | "hidden-gems" | "biggest-movers" | "next-100x";

export const CATEGORY_META: Record<string, { title: string; description: string; h1: string }> = {
  "next-100x-altcoins": {
    title: "Next 100x Altcoins 2026 | Top Low-Cap Crypto Picks",
    description: "Discover the top altcoins with the highest potential for 100x growth in 2026. Scored by volume, momentum, and market cap potential.",
    h1: "Next 100x Altcoins",
  },
  "next-100x-ai-coins": {
    title: "Next 100x AI Crypto Coins 2026 | Top AI Token Picks",
    description: "Top AI cryptocurrency tokens with the highest growth potential. Ranked by our proprietary scoring algorithm.",
    h1: "Next 100x AI Coins",
  },
  "next-100x-gaming-coins": {
    title: "Next 100x Gaming Crypto Coins 2026 | Top GameFi Picks",
    description: "Discover the best gaming and GameFi crypto tokens with massive growth potential. Play-to-earn coins ranked by score.",
    h1: "Next 100x Gaming Coins",
  },
  "next-100x-defi-coins": {
    title: "Next 100x DeFi Coins 2026 | Top Decentralized Finance Picks",
    description: "Top DeFi tokens with the highest upside potential. Decentralized finance coins ranked by volume, momentum and market cap.",
    h1: "Next 100x DeFi Coins",
  },
  "next-100x-layer1-coins": {
    title: "Next 100x Layer 1 Coins 2026 | Top Blockchain Picks",
    description: "Best Layer 1 blockchain tokens with massive growth potential. L1 coins ranked by market cap potential and momentum.",
    h1: "Next 100x Layer 1 Coins",
  },
  "hidden-gems": {
    title: "Hidden Gem Cryptos Under $50M Market Cap | Low-Cap Discoveries",
    description: "Find the best hidden gem cryptocurrencies with market caps under $50M. Low-cap tokens with high potential scored by our algorithm.",
    h1: "Hidden Gems Under $50M",
  },
  "biggest-movers": {
    title: "Biggest Crypto Movers Today | Top Gainers & Losers",
    description: "See which cryptocurrencies are making the biggest moves today. Top gainers and biggest price changes in the last 24 hours.",
    h1: "Biggest Movers Today",
  },
};

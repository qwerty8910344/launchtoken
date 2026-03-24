import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Rocket, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 text-center max-w-3xl space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Launch Your Token <br />
          <span className="text-primary">Without Coding</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          The ultimate platform to create, manage, and track Web3 tokens.
          Get listed on major exchanges with zero technical experience required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/create-token">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <Rocket className="w-5 h-5" /> Start Building
            </Button>
          </Link>
          <Link href="/crypto">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              <BarChart3 className="w-5 h-5" /> View Markets
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

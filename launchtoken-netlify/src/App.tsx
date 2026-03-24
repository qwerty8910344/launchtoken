import { Suspense, lazy } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { Skeleton } from "@/components/ui/skeleton";

const LandingPage = lazy(() => import("@/pages/landing"));
const LoginPage = lazy(() => import("@/pages/login"));
const RegisterPage = lazy(() => import("@/pages/register"));
const ForgotPasswordPage = lazy(() => import("@/pages/forgot-password"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password"));
const FirebaseActionHandler = lazy(() => import("@/pages/firebase-action"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const CreateTokenPage = lazy(() => import("@/pages/create-token"));
const TokenDetailPage = lazy(() => import("@/pages/token-detail"));
const PaymentPage = lazy(() => import("@/pages/payment"));
const AdminPage = lazy(() => import("@/pages/admin"));
const ListingPaymentPage = lazy(() => import("@/pages/listing-payment"));
const CryptoPage = lazy(() => import("@/pages/crypto"));
const CoinPage = lazy(() => import("@/pages/crypto-coin"));
const CryptoPricePage = lazy(() => import("@/pages/crypto-price"));
const CryptoPredictionPage = lazy(() => import("@/pages/crypto-prediction"));
const CryptoCalculatorPage = lazy(() => import("@/pages/crypto-calculator"));
const CryptoMarketCapPage = lazy(() => import("@/pages/crypto-market-cap"));
const CryptoCategoryPage = lazy(() => import("@/pages/crypto-category"));
const NotFound = lazy(() => import("@/pages/not-found"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-4 w-64">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.LazyExoticComponent<() => JSX.Element> }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function GuestRoute({ component: Component }: { component: React.LazyExoticComponent<() => JSX.Element> }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login">{() => <GuestRoute component={LoginPage} />}</Route>
        <Route path="/register">{() => <GuestRoute component={RegisterPage} />}</Route>
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/reset-password" component={ResetPasswordPage} />
        <Route path="/auth/action" component={FirebaseActionHandler} />
        <Route path="/dashboard">{() => <ProtectedRoute component={DashboardPage} />}</Route>
        <Route path="/create-token">{() => <ProtectedRoute component={CreateTokenPage} />}</Route>
        <Route path="/tokens/:id">{() => <ProtectedRoute component={TokenDetailPage} />}</Route>
        <Route path="/payment/:id">{() => <ProtectedRoute component={PaymentPage} />}</Route>
        <Route path="/listing-payment/:tokenId/:exchangeId">{() => <ProtectedRoute component={ListingPaymentPage} />}</Route>
        <Route path="/crypto" component={CryptoPage} />
        <Route path="/crypto/next-100x-altcoins">{() => <CryptoCategoryPage />}</Route>
        <Route path="/crypto/next-100x-ai-coins">{() => <CryptoCategoryPage />}</Route>
        <Route path="/crypto/next-100x-gaming-coins">{() => <CryptoCategoryPage />}</Route>
        <Route path="/crypto/next-100x-defi-coins">{() => <CryptoCategoryPage />}</Route>
        <Route path="/crypto/next-100x-layer1-coins">{() => <CryptoCategoryPage />}</Route>
        <Route path="/crypto/hidden-gems">{() => <CryptoCategoryPage />}</Route>
        <Route path="/crypto/biggest-movers">{() => <CryptoCategoryPage />}</Route>
        <Route path="/crypto/:coin/price" component={CryptoPricePage} />
        <Route path="/crypto/:coin/price-prediction" component={CryptoPredictionPage} />
        <Route path="/crypto/:coin/profit-calculator" component={CryptoCalculatorPage} />
        <Route path="/crypto/:coin/market-cap" component={CryptoMarketCapPage} />
        <Route path="/crypto/:coin" component={CoinPage} />
        <Route path="/admin">{() => <ProtectedRoute component={AdminPage} />}</Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

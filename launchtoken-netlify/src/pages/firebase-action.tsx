import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";

export default function FirebaseActionHandler() {
  const [, navigate] = useLocation();
  const search = useSearch();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const mode = params.get("mode");
    const oobCode = params.get("oobCode");

    if (mode === "resetPassword" && oobCode) {
      navigate(`/reset-password?mode=${mode}&oobCode=${oobCode}`);
    } else {
      navigate("/login");
    }
  }, [search, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}

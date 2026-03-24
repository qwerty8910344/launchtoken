'use client';
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function FirebaseActionHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const mode = searchParams.get("mode");
    const oobCode = searchParams.get("oobCode");
    if (mode === "resetPassword" && oobCode) {
      router.push(`/reset-password?mode=${mode}&oobCode=${oobCode}`);
    } else {
      router.push("/login");
    }
  }, [router, searchParams]);
  return <p style={{ padding: "2rem", textAlign: "center" }}>Processing...</p>;
}

export default function AuthActionPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <FirebaseActionHandler />
    </Suspense>
  );
}

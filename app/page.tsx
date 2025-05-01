"use client";

import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

// Client-only component with no SSR to prevent hydration mismatch
const KYCFlow = dynamic(() => import("./components/KYCFlow"), {
  ssr: false,
  loading: () => (
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p>Loading...</p>
    </div>
  ),
});

export default function Home() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const id = searchParams.get("id");

  // Show loading until client-side component is ready
  return <KYCFlow token={token} id={id} />;
}

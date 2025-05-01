import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Import the KYCFlow component with no SSR to avoid hydration issues
const KYCFlow = dynamic(() => import("../app/components/KYCFlow"), {
  ssr: false,
  loading: () => (
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p>Loading...</p>
    </div>
  ),
});

export default function Home() {
  // Using client-side searchParams to avoid hydration issues
  const [params, setParams] = useState<URLSearchParams>(new URLSearchParams());
  const [isLoading, setIsLoading] = useState(true);

  // Extract URL params after component mounts to avoid hydration issues
  useEffect(() => {
    setParams(new URLSearchParams(window.location.search));
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const token = params.get("token");
  const id = params.get("id");

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <KYCFlow token={token} id={id} />
    </div>
  );
}

// Ensure this page only renders on the client side
export function getStaticProps() {
  return {
    props: {},
  };
}

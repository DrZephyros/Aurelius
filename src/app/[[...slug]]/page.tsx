import AureliusClient from "@/components/aurelius-client";

export const dynamic = "force-static";

// Every site path is rendered by the client app (History-API router in lib/router.tsx).
export default function CatchAll() {
  return <AureliusClient />;
}

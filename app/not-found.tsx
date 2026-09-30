import type { Metadata } from "next";
import { ErrorScreen } from "@/components/chrome/ErrorScreen";

export const metadata: Metadata = { title: "Beyond the map", robots: { index: false } };

export default function NotFound() {
  return (
    <ErrorScreen
      code="404 · Uncharted"
      title="You've wandered beyond the map."
      body="This place isn't on our map of Bangladesh — yet. Follow the rivers back to where the journey begins."
      action={{ label: "Return to Bangladesh", href: "/" }}
    />
  );
}

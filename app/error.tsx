"use client";
import { useEffect } from "react";
import { ErrorScreen } from "@/components/chrome/ErrorScreen";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <ErrorScreen
      code="500 · Interrupted"
      title="The journey was interrupted."
      body="Something went wrong while loading this part of the delta. The river keeps flowing — let's try again."
      action={{ label: "Try again", onClick: reset }}
    />
  );
}

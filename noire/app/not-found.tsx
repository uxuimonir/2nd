import type { Metadata } from "next";
import { Noire404 } from "@/components/sections";
import { img } from "@/lib/view";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return <Noire404 message="This room is empty — the page may have moved, or the link was mistyped. The work is still here." image={{ ...img("notfound"), alt: "" }} />;
}

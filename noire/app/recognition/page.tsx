import type { Metadata } from "next";
import { NoireBlocks, NoirePageHero } from "@/components/sections";
import { recognition } from "@/content/studio";

export const metadata: Metadata = {
  title: "Recognition",
  description: "Awards, exhibitions, talks, publications and milestones.",
  alternates: { canonical: "/recognition" },
};

export default function RecognitionPage() {
  return (
    <>
      <NoirePageHero label="Recognition" title="Awards, shows," accent="talks & print." lede={`${recognition.length} entries. All are fictional demo content — replace them with your own.`} meta="" imageRatio={1.78} dark={false} />
      <NoireBlocks
        variant="rows"
        label="Index"
        heading=""
        accent=""
        text=""
        caption=""
        dark={false}
        items={recognition.map((r) => ({ a: `${r.year} · ${r.kind}`, b: r.title, c: `${r.body}. ${r.detail}`, link: r.project ? `/work/${r.project}` : "" }))}
      />
    </>
  );
}

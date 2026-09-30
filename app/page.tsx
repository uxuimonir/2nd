import { Journey } from "@/features/journey/Journey";
import { getJourney } from "@/services/content";

export default async function HomePage() {
  const data = await getJourney();
  return <Journey data={data} />;
}

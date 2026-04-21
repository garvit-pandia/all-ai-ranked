import Dashboard from "@/components/dashboard";
import { getDashboardData } from "@/lib/data/loaders";

export default async function Home() {
  const data = await getDashboardData();

  return (
    <div className="flex flex-1 flex-col">
      <Dashboard initialModels={data.models} initialChatbots={data.chatbots} />
    </div>
  );
}

import { getDashboardData } from "@/lib/data/loaders";
import { suggestBestPicks } from "@/lib/suggest/recommend";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { task?: string };
    const task = body.task?.trim();

    if (!task || task.length < 8) {
      return Response.json(
        { error: "Task description must be at least 8 characters." },
        { status: 400 },
      );
    }

    const data = await getDashboardData();
    const result = await suggestBestPicks({
      task,
      models: data.models,
      chatbots: data.chatbots,
    });

    return Response.json(result);
  } catch {
    return Response.json(
      { error: "Unexpected error while generating suggestions." },
      { status: 500 },
    );
  }
}

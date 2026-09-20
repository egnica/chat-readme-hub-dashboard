import { listMarkdownFiles } from "@/lib/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const files = await listMarkdownFiles();
    return Response.json({ files });
  } catch (error) {
    return Response.json(
      { error: error.message || "Unable to load Markdown files." },
      { status: error.status || 500 },
    );
  }
}

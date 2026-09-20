import {
  deleteMarkdownFile,
  getMarkdownFile,
  updateMarkdownFile,
} from "@/lib/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error, fallback) {
  return Response.json(
    { error: error.message || fallback },
    { status: error.status || 500 },
  );
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
    const file = await getMarkdownFile(path);
    return Response.json({ file });
  } catch (error) {
    return errorResponse(error, "Unable to load Markdown file.");
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const result = await updateMarkdownFile(body.path, body.content, body.sha);
    return Response.json({ ok: true, ...result });
  } catch (error) {
    return errorResponse(error, "Unable to save Markdown file.");
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const result = await deleteMarkdownFile(body.path, body.sha);
    return Response.json({ ok: true, ...result });
  } catch (error) {
    return errorResponse(error, "Unable to delete Markdown file.");
  }
}

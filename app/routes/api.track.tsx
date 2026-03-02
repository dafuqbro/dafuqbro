import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { getDB } from "~/lib/db";

// GET /api/track — return current count
export async function loader({ context }: LoaderFunctionArgs) {
  const db = getDB(context);

  // Ensure stats row exists
  const row = await db
    .prepare("SELECT total FROM stats WHERE id = 1")
    .first<{ total: number }>();

  return Response.json(
    { count: row?.total ?? 0 },
    { headers: { "Cache-Control": "public, max-age=30" } }
  );
}

// POST /api/track — increment counter
export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const db = getDB(context);

  // Upsert: insert if not exists, otherwise increment
  await db
    .prepare(
      `INSERT INTO stats (id, total) VALUES (1, 1)
       ON CONFLICT(id) DO UPDATE SET total = total + 1`
    )
    .run();

  const row = await db
    .prepare("SELECT total FROM stats WHERE id = 1")
    .first<{ total: number }>();

  return Response.json({ count: row?.total ?? 1 });
}

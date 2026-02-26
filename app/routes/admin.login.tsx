import { useState } from "react";
import { redirect, useActionData } from "react-router";
import type { MetaFunction, ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { getDB, createSession, validateSession, getSessionFromCookie } from "~/lib/db";

export const meta: MetaFunction = () => [{ title: "Admin Login — DaFuqBro" }];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = getDB(context);
  const sessionId = getSessionFromCookie(request);
  if (await validateSession(db, sessionId)) {
    return redirect("/admin");
  }
  return null;
}

export async function action({ request, context }: ActionFunctionArgs) {
  const form = await request.formData();
  const username = form.get("username") as string;
  const password = form.get("password") as string;

  const env = (context as any).cloudflare.env;
  const validUser = env.ADMIN_USERNAME || "admin";
  const validPass = env.ADMIN_PASSWORD || "changeme";

  if (username === validUser && password === validPass) {
    const db = getDB(context);
    const sessionId = await createSession(db);
    return redirect("/admin", {
      headers: {
        "Set-Cookie": `dfb_session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`,
      },
    });
  }

  return { error: "Wrong credentials. Try again." };
}

export default function AdminLogin() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-8">
          <span className="text-[3rem] block mb-3">🔐</span>
          <h1 className="font-['Outfit'] font-extrabold text-[1.8rem] tracking-tight mb-2">
            Admin Panel
          </h1>
          <p className="text-[#71717a] text-[0.85rem]">DaFuqBro Content Management</p>
        </div>

        <form method="post" className="flex flex-col gap-4">
          {actionData?.error && (
            <div className="bg-[#f87171]/10 border border-[#f87171]/20 text-[#f87171] text-[0.85rem] p-3 rounded-xl text-center">
              {actionData.error}
            </div>
          )}

          <div>
            <label className="block text-[0.82rem] font-medium text-[#a1a1aa] mb-1.5">Username</label>
            <input
              type="text"
              name="username"
              required
              autoComplete="username"
              className="w-full bg-[#1a1a1f] border border-white/[0.06] rounded-xl py-3 px-4 text-[#f4f4f5] text-[0.95rem] outline-none focus:border-[#facc15]/40"
            />
          </div>

          <div>
            <label className="block text-[0.82rem] font-medium text-[#a1a1aa] mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full bg-[#1a1a1f] border border-white/[0.06] rounded-xl py-3 px-4 text-[#f4f4f5] text-[0.95rem] outline-none focus:border-[#facc15]/40"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-br from-[#facc15] to-[#f59e0b] text-[#09090b] font-['Outfit'] font-bold text-[0.95rem] cursor-pointer transition-all hover:-translate-y-0.5 mt-2"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import QuizClient from "./QuizClient";

export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const username =
    user.user_metadata?.username || user.email?.split("@")[0] || "Invocador";

  return <QuizClient userId={user.id} username={username} />;
}

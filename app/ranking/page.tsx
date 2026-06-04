import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Attempt = {
  id: string;
  username: string;
  score: number;
  total: number;
  created_at: string;
};

export default async function RankingPage() {
  const supabase = await createClient();

  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("id, username, score, total, created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(50);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const topAttempts: Attempt[] = attempts || [];

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div
      className="min-h-screen px-4 py-10"
      style={{ background: "linear-gradient(135deg, #0a0e1a, #0d1b2a)" }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl font-black"
              style={{ color: "#c89b3c" }}
            >
              🏆 Ranking
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Top Invocadores do Bronze
            </p>
          </div>
          <div className="flex gap-3">
            {user ? (
              <Link href="/quiz" className="btn-primary py-2 px-4 text-sm">
                Jogar
              </Link>
            ) : (
              <Link href="/login" className="btn-primary py-2 px-4 text-sm">
                Entrar
              </Link>
            )}
            <Link href="/" className="btn-secondary py-2 px-4 text-sm">
              Home
            </Link>
          </div>
        </div>

        {/* Table */}
        {topAttempts.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">😴</div>
            <p className="text-slate-400">
              Ninguém jogou ainda. Seja o primeiro!
            </p>
            <Link href={user ? "/quiz" : "/login"} className="btn-primary mt-4 inline-block">
              Jogar Agora
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {topAttempts.map((attempt, i) => {
              const percentage = Math.round((attempt.score / attempt.total) * 100);
              const isCurrentUser =
                user?.user_metadata?.username === attempt.username ||
                user?.email?.split("@")[0] === attempt.username;

              return (
                <div
                  key={attempt.id}
                  className="flex items-center gap-4 rounded-xl p-4"
                  style={{
                    background: isCurrentUser
                      ? "rgba(200,155,60,0.12)"
                      : "#111827",
                    border: `1px solid ${
                      isCurrentUser
                        ? "rgba(200,155,60,0.4)"
                        : i < 3
                        ? "rgba(200,155,60,0.2)"
                        : "#1e3a5f"
                    }`,
                  }}
                >
                  {/* Position */}
                  <div className="w-10 text-center text-xl font-black">
                    {i < 3 ? medals[i] : `#${i + 1}`}
                  </div>

                  {/* Username */}
                  <div className="flex-1">
                    <div className="font-semibold text-white flex items-center gap-2">
                      {attempt.username}
                      {isCurrentUser && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{
                            background: "rgba(200,155,60,0.2)",
                            color: "#c89b3c",
                          }}
                        >
                          Você
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {new Date(attempt.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="flex flex-col items-end gap-1 min-w-[100px]">
                    <span
                      className="font-black text-lg"
                      style={{ color: "#c89b3c" }}
                    >
                      {attempt.score}/{attempt.total}
                    </span>
                    <div className="w-24 bg-slate-700 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${percentage}%`,
                          background:
                            percentage >= 70
                              ? "#22c55e"
                              : percentage >= 40
                              ? "#eab308"
                              : "#ef4444",
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

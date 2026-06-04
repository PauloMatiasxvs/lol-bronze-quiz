import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, #0a0e1a 0%, #0d1b2a 50%, #0a0e1a 100%)",
      }}
    >
      {/* Header */}
      <div className="absolute top-4 right-4 flex gap-3">
        {user ? (
          <>
            <Link
              href="/ranking"
              className="btn-secondary text-sm py-2 px-4"
            >
              Ranking
            </Link>
            <Link href="/quiz" className="btn-primary text-sm py-2 px-4">
              Jogar
            </Link>
            <form action="/auth/signout" method="POST">
              <button type="submit" className="btn-secondary text-sm py-2 px-4">
                Sair
              </button>
            </form>
          </>
        ) : (
          <>
            <Link
              href="/ranking"
              className="btn-secondary text-sm py-2 px-4"
            >
              Ranking
            </Link>
            <Link href="/login" className="btn-primary text-sm py-2 px-4">
              Entrar
            </Link>
          </>
        )}
      </div>

      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <span className="badge-bronze text-base px-4 py-1">
            BRONZE I - IV
          </span>
        </div>

        <h1
          className="text-5xl font-black mb-4"
          style={{
            color: "#c89b3c",
            textShadow: "0 0 30px rgba(200,155,60,0.5)",
          }}
        >
          LoL Bronze Quiz
        </h1>
        <p className="text-xl text-slate-300 mb-2">
          Você realmente sabe jogar League of Legends?
        </p>
        <p className="text-slate-400 mb-10">
          Teste seus conhecimentos sobre campeões, macro, micro e objetivos.
          Perguntas especialmente selecionadas para a divisão Bronze!
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { value: "42", label: "Perguntas" },
            { value: "30s", label: "Por pergunta" },
            { value: "5", label: "Categorias" },
          ].map((s) => (
            <div key={s.label} className="card text-center">
              <div
                className="text-3xl font-black"
                style={{ color: "#c89b3c" }}
              >
                {s.value}
              </div>
              <div className="text-sm text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        {user ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-slate-400">
              Bem-vindo de volta! Pronto para melhorar seu ranking?
            </p>
            <div className="flex gap-4">
              <Link href="/quiz" className="btn-primary text-lg px-8 py-3">
                Iniciar Quiz
              </Link>
              <Link href="/ranking" className="btn-secondary text-lg px-8 py-3">
                Ver Ranking
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Link href="/login" className="btn-primary text-lg px-10 py-4">
              Jogar Agora
            </Link>
            <p className="text-sm text-slate-500">
              Crie sua conta gratuita e entre no ranking!
            </p>
          </div>
        )}

        {/* Categories */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {[
            { icon: "⚔️", label: "Campeões" },
            { icon: "🗺️", label: "Macro" },
            { icon: "🎯", label: "Micro" },
            { icon: "🛡️", label: "Itens" },
            { icon: "🐉", label: "Objetivos" },
          ].map((cat) => (
            <span
              key={cat.label}
              className="card py-2 px-4 text-sm text-slate-300 flex items-center gap-2"
            >
              <span>{cat.icon}</span> {cat.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

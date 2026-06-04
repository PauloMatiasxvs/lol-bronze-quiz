"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function usernameToEmail(username: string) {
  return `${username.toLowerCase().replace(/[^a-z0-9]/g, "")}@lolbronzequiz.gg`;
}

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const fakeEmail = usernameToEmail(username);

    if (isRegister) {
      if (username.trim().length < 3) {
        setError("Nome precisa ter pelo menos 3 caracteres.");
        setLoading(false);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: fakeEmail,
        password,
        options: { data: { username: username.trim() } },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered") || signUpError.message.includes("already been registered")) {
          setError("Este nome de invocador já está em uso.");
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push("/");
        router.refresh();
        return;
      }

      // Tenta logar direto após cadastro
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password,
      });
      if (!signInError) {
        router.push("/");
        router.refresh();
        return;
      }
      setError("Conta criada! Agora faça login.");
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password,
      });
      if (signInError) {
        setError("Nome de invocador ou senha incorretos.");
      } else {
        router.push("/");
        router.refresh();
      }
    }

    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0a0e1a, #0d1b2a)" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-black" style={{ color: "#c89b3c" }}>
              LoL Bronze Quiz
            </h1>
          </Link>
          <p className="text-slate-400 mt-2">
            {isRegister ? "Crie sua conta de Invocador" : "Entre na sua conta"}
          </p>
        </div>

        <div className="card">
          {/* Tabs */}
          <div className="flex mb-6 rounded-lg overflow-hidden border border-slate-700">
            {(["login", "register"] as const).map((tab) => {
              const active = tab === (isRegister ? "register" : "login");
              return (
                <button
                  key={tab}
                  className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                    active ? "text-black" : "text-slate-400"
                  }`}
                  style={
                    active
                      ? { background: "linear-gradient(135deg, #c89b3c, #a67c2c)" }
                      : { background: "transparent" }
                  }
                  onClick={() => {
                    setIsRegister(tab === "register");
                    setError("");
                  }}
                >
                  {tab === "login" ? "Entrar" : "Criar Conta"}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Nome de Invocador
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="Ex: BronzeKing420"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Senha
              </label>
              <input
                className="input-field"
                type="password"
                placeholder={isRegister ? "Mínimo 6 caracteres" : "Sua senha"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={isRegister ? "new-password" : "current-password"}
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full py-3 mt-2"
              disabled={loading}
            >
              {loading
                ? "Carregando..."
                : isRegister
                ? "Criar Conta"
                : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center mt-4">
          <Link href="/" className="text-slate-400 text-sm hover:text-slate-200">
            ← Voltar para a home
          </Link>
        </p>
      </div>
    </div>
  );
}

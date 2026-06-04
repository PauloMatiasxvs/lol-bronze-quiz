"use client";

import { useState, useEffect, useCallback } from "react";
import { getFixedQuestions, type Question, categoryLabels } from "@/lib/questions";
import Link from "next/link";
import Image from "next/image";

const TIME_PER_QUESTION = 30;
const QUESTIONS_COUNT = 15;

type QuizState = "idle" | "playing" | "finished";

export default function QuizClient({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) {
  const [state, setState] = useState<QuizState>("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [showExplanation, setShowExplanation] = useState(false);
  const [saving, setSaving] = useState(false);

  const goNext = useCallback(() => {
    setShowExplanation(false);
    setSelected(null);
    setTimeLeft(TIME_PER_QUESTION);
    if (current + 1 >= questions.length) {
      setState("finished");
    } else {
      setCurrent((c) => c + 1);
    }
  }, [current, questions.length]);

  // Timer
  useEffect(() => {
    if (state !== "playing" || showExplanation) return;

    if (timeLeft === 0) {
      setAnswers((prev) => {
        const next = [...prev];
        next[current] = null;
        return next;
      });
      setShowExplanation(true);
      setTimeout(goNext, 2500);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [state, timeLeft, showExplanation, current, goNext]);

  // Save result when finished
  useEffect(() => {
    if (state !== "finished") return;

    const score = answers.filter(
      (a, i) => a === questions[i]?.correct
    ).length;

    setSaving(true);
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase
        .from("quiz_attempts")
        .insert({
          user_id: userId,
          username,
          score,
          total: questions.length,
          answers: answers,
        })
        .then(() => setSaving(false));
    });
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  function startQuiz() {
    const qs = getFixedQuestions();
    setQuestions(qs);
    setAnswers(new Array(QUESTIONS_COUNT).fill(undefined));
    setCurrent(0);
    setSelected(null);
    setTimeLeft(TIME_PER_QUESTION);
    setShowExplanation(false);
    setState("playing");
  }

  function handleAnswer(optionIndex: number) {
    if (selected !== null || showExplanation) return;

    setSelected(optionIndex);
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = optionIndex;
      return next;
    });
    setShowExplanation(true);

    setTimeout(goNext, 2500);
  }

  const score = answers.filter((a, i) => a === questions[i]?.correct).length;
  const q = questions[current];

  // IDLE state
  if (state === "idle") {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(135deg, #0a0e1a, #0d1b2a)" }}
      >
        <div className="card max-w-md w-full text-center">
          <div className="text-5xl mb-4">🎮</div>
          <h2 className="text-2xl font-black mb-2" style={{ color: "#c89b3c" }}>
            Pronto, {username}?
          </h2>
          <p className="text-slate-400 mb-6">
            Você terá <strong className="text-white">30 segundos</strong> para
            responder cada pergunta. São {QUESTIONS_COUNT} perguntas no total.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6 text-sm text-slate-300">
            <div className="bg-slate-800 rounded-lg p-3">⚔️ Campeões</div>
            <div className="bg-slate-800 rounded-lg p-3">🗺️ Macro</div>
            <div className="bg-slate-800 rounded-lg p-3">🎯 Micro</div>
            <div className="bg-slate-800 rounded-lg p-3">🐉 Objetivos</div>
          </div>
          <button onClick={startQuiz} className="btn-primary w-full py-3 text-lg">
            Iniciar Quiz!
          </button>
          <div className="mt-4">
            <Link href="/" className="text-slate-500 text-sm hover:text-slate-300">
              ← Voltar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // FINISHED state
  if (state === "finished") {
    const percentage = Math.round((score / questions.length) * 100);
    const rank =
      percentage >= 90
        ? { label: "Lendário!", color: "#ffd700", emoji: "👑" }
        : percentage >= 70
        ? { label: "Diamante!", color: "#a8c0d6", emoji: "💎" }
        : percentage >= 50
        ? { label: "Platina!", color: "#7cc8a0", emoji: "🏆" }
        : percentage >= 30
        ? { label: "Bronze III", color: "#a0522d", emoji: "🥉" }
        : { label: "Ferro IV", color: "#888", emoji: "😅" };

    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(135deg, #0a0e1a, #0d1b2a)" }}
      >
        <div className="card max-w-md w-full text-center">
          <div className="text-5xl mb-2">{rank.emoji}</div>
          <h2
            className="text-3xl font-black mb-1"
            style={{ color: rank.color }}
          >
            {rank.label}
          </h2>
          <p className="text-slate-400 mb-6">Resultado de {username}</p>

          <div
            className="text-7xl font-black mb-2"
            style={{ color: "#c89b3c" }}
          >
            {score}/{questions.length}
          </div>
          <div className="text-slate-400 mb-6">{percentage}% de acertos</div>

          {/* Per-question review */}
          <div className="flex flex-col gap-2 mb-6 max-h-48 overflow-y-auto">
            {questions.map((q2, i) => (
              <div
                key={q2.id}
                className="flex items-center gap-3 text-sm rounded-lg p-2"
                style={{
                  background:
                    answers[i] === q2.correct
                      ? "rgba(34,197,94,0.1)"
                      : "rgba(239,68,68,0.1)",
                  border: `1px solid ${
                    answers[i] === q2.correct
                      ? "rgba(34,197,94,0.3)"
                      : "rgba(239,68,68,0.3)"
                  }`,
                }}
              >
                <span>{answers[i] === q2.correct ? "✅" : "❌"}</span>
                <span className="text-left text-slate-300 truncate">
                  {q2.question}
                </span>
              </div>
            ))}
          </div>

          {saving && (
            <p className="text-slate-500 text-sm mb-3">Salvando resultado...</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setState("idle");
                setAnswers([]);
              }}
              className="btn-primary flex-1 py-3"
            >
              Jogar de Novo
            </button>
            <Link href="/ranking" className="btn-secondary flex-1 py-3 flex items-center justify-center">
              Ver Ranking
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // PLAYING state
  const timerPercent = (timeLeft / TIME_PER_QUESTION) * 100;
  const timerColor =
    timeLeft > 15 ? "#22c55e" : timeLeft > 7 ? "#eab308" : "#ef4444";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ background: "linear-gradient(135deg, #0a0e1a, #0d1b2a)" }}
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-400 text-sm">
            Pergunta{" "}
            <strong className="text-white">
              {current + 1}/{questions.length}
            </strong>
          </span>
          <span className="badge-bronze">
            {categoryLabels[q.category]}
          </span>
          <span className="text-slate-400 text-sm">
            Pontos:{" "}
            <strong className="text-white" style={{ color: "#c89b3c" }}>
              {score}
            </strong>
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 mb-6">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((current + 1) / questions.length) * 100}%`,
              background: "linear-gradient(90deg, #c89b3c, #d4af50)",
            }}
          />
        </div>

        {/* Timer */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full transition-all duration-1000"
              style={{
                width: `${timerPercent}%`,
                background: timerColor,
              }}
            />
          </div>
          <div
            className={`font-black text-xl w-12 text-right ${
              timeLeft <= 7 ? "timer-warning" : ""
            }`}
            style={{ color: timerColor }}
          >
            {timeLeft}s
          </div>
        </div>

        {/* Question card */}
        <div className="card mb-4">
          {q.image && (
            <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
              <Image
                src={q.image}
                alt="Champion"
                fill
                className="object-cover object-top"
                unoptimized
              />
            </div>
          )}
          <h2 className="text-lg font-semibold text-white leading-snug">
            {q.question}
          </h2>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
          {q.options.map((option, i) => {
            let bg = "#1a2332";
            let border = "#1e3a5f";
            let textColor = "#e2e8f0";

            if (showExplanation) {
              if (i === q.correct) {
                bg = "rgba(34,197,94,0.15)";
                border = "#22c55e";
                textColor = "#86efac";
              } else if (i === selected && i !== q.correct) {
                bg = "rgba(239,68,68,0.15)";
                border = "#ef4444";
                textColor = "#fca5a5";
              }
            } else if (selected === i) {
              bg = "rgba(200,155,60,0.15)";
              border = "#c89b3c";
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={showExplanation}
                className="text-left rounded-lg p-4 font-medium transition-all duration-200 cursor-pointer disabled:cursor-default"
                style={{
                  background: bg,
                  border: `1px solid ${border}`,
                  color: textColor,
                }}
              >
                <span
                  className="inline-block w-7 h-7 rounded-full text-center text-sm font-bold mr-3"
                  style={{ background: border, color: "#0a0e1a", lineHeight: "1.75rem" }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div
            className="mt-4 rounded-lg p-4 text-sm"
            style={{
              background: "rgba(200,155,60,0.1)",
              border: "1px solid rgba(200,155,60,0.3)",
              color: "#e2c97e",
            }}
          >
            <strong>Explicação:</strong> {q.explanation}
          </div>
        )}
      </div>
    </div>
  );
}

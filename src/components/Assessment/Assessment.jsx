"use client";

import { useEffect, useState } from "react";
import { QUESTIONS, TOPICS } from "@/data/assessmentQuestions";
import { highlightCSharp } from "./highlightCSharp";
import "./Assessment.css";

const SECONDS_PER_QUESTION = 90;

const KIND_LABEL = {
  choice: "Multiple choice",
  output: "Read the code",
  bug: "Spot the bug",
};

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// picked is an option index, or a line number for bug questions.
function isCorrect(q, picked) {
  return q.kind === "bug" ? picked === q.bugLine : picked === q.answer;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Assessment() {
  const [screen, setScreen] = useState("start"); // start | quiz | results
  const [topic, setTopic] = useState("all");
  const [mode, setMode] = useState("practice"); // practice | mock
  const [deck, setDeck] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // id -> { picked, correct }
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Mock mode countdown; time up ends the quiz.
  useEffect(() => {
    if (screen !== "quiz" || mode !== "mock") return;
    const t = setTimeout(() => {
      if (secondsLeft <= 1) setScreen("results");
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [screen, mode, secondsLeft]);

  function start(questions) {
    const picked = shuffle(questions);
    setDeck(picked);
    setIndex(0);
    setAnswers({});
    setSecondsLeft(picked.length * SECONDS_PER_QUESTION);
    setScreen("quiz");
    window.scrollTo({ top: 0 });
  }

  function startFromMenu() {
    start(topic === "all" ? QUESTIONS : QUESTIONS.filter((q) => q.topic === topic));
  }

  function next() {
    if (index + 1 >= deck.length) setScreen("results");
    else setIndex((i) => i + 1);
  }

  function answer(picked) {
    const q = deck[index];
    if (answers[q.id]) return;
    setAnswers((a) => ({ ...a, [q.id]: { picked, correct: isCorrect(q, picked) } }));
    if (mode === "mock") next();
  }

  const score = Object.values(answers).filter((a) => a.correct).length;

  if (screen === "start") {
    return (
      <main className="qz">
        <header className="qz-hero">
          <p className="qz-eyebrow">Interview practice</p>
          <h1>C# &amp; OOP Pop Quiz</h1>
          <p className="qz-lead">
            {QUESTIONS.length} questions on the C# and OOP fundamentals behind factory-automation software:
            state machines, TCP byte handling, async code, threading and more. Read the code, pick the answer,
            or find and fix the bug.
          </p>
        </header>

        <section className="qz-card">
          <h2 className="qz-label">Topic</h2>
          <div className="qz-chips">
            <button className={topic === "all" ? "on" : ""} onClick={() => setTopic("all")}>
              All topics
            </button>
            {Object.keys(TOPICS).map((t) => (
              <button key={t} className={topic === t ? "on" : ""} onClick={() => setTopic(t)}>
                {TOPICS[t]}
              </button>
            ))}
          </div>

          <h2 className="qz-label">Mode</h2>
          <div className="qz-modes">
            <button className={mode === "practice" ? "on" : ""} onClick={() => setMode("practice")}>
              <strong>Practice</strong>
              <span>See the explanation after every question.</span>
            </button>
            <button className={mode === "mock" ? "on" : ""} onClick={() => setMode("mock")}>
              <strong>Mock interview</strong>
              <span>Timed, {SECONDS_PER_QUESTION}s per question. Answers at the end.</span>
            </button>
          </div>

          <button className="qz-primary" onClick={startFromMenu}>
            Start quiz
          </button>
        </section>
      </main>
    );
  }

  if (screen === "results") {
    const missed = deck.filter((q) => !answers[q.id]?.correct);
    const topicsInDeck = [...new Set(deck.map((q) => q.topic))];
    const pct = deck.length ? Math.round((score / deck.length) * 100) : 0;

    return (
      <main className="qz">
        <section className="qz-card qz-center">
          <p className="qz-eyebrow">Your result</p>
          <p className="qz-score">
            {score} / {deck.length}
          </p>
          <p className="qz-lead">
            {pct >= 80
              ? "Strong fundamentals. You're ready to explain these out loud."
              : pct >= 50
                ? "Good base. Review the misses below and retry them."
                : "Every miss here is one you won't miss in the interview. Review and retry."}
          </p>
          <div className="qz-actions">
            {missed.length > 0 && (
              <button className="qz-primary" onClick={() => start(missed)}>
                Retry the {missed.length} I missed
              </button>
            )}
            <button className="qz-secondary" onClick={() => setScreen("start")}>
              Back to start
            </button>
          </div>
        </section>

        <section className="qz-card">
          <h2 className="qz-label">By topic</h2>
          {topicsInDeck.map((t) => {
            const qs = deck.filter((q) => q.topic === t);
            const ok = qs.filter((q) => answers[q.id]?.correct).length;
            return (
              <div key={t} className="qz-bar-row">
                <span>{TOPICS[t]}</span>
                <div className="qz-bar">
                  <div style={{ width: `${(ok / qs.length) * 100}%` }} />
                </div>
                <span className="qz-muted">
                  {ok}/{qs.length}
                </span>
              </div>
            );
          })}
        </section>

        {missed.length > 0 && (
          <section>
            <h2 className="qz-section-title">Review what you missed</h2>
            {missed.map((q) => (
              <QuestionCard key={q.id} q={q} answer={answers[q.id]} reveal onPick={() => {}} />
            ))}
          </section>
        )}
      </main>
    );
  }

  const q = deck[index];
  const current = answers[q.id];

  return (
    <main className="qz">
      <div className="qz-top">
        <span>
          Question {index + 1} of {deck.length}
        </span>
        {mode === "mock" ? (
          <span className={secondsLeft < 60 ? "qz-timer low" : "qz-timer"}>{formatTime(secondsLeft)}</span>
        ) : (
          <span>Score {score}</span>
        )}
      </div>
      <div className="qz-progress">
        <div style={{ width: `${(index / deck.length) * 100}%` }} />
      </div>

      <QuestionCard q={q} answer={current} reveal={mode === "practice" && !!current} onPick={answer} />

      {mode === "practice" && current && (
        <button className="qz-primary" onClick={next}>
          {index + 1 >= deck.length ? "See results" : "Next question"}
        </button>
      )}
      <button className="qz-link" onClick={() => setScreen("results")}>
        End quiz
      </button>
    </main>
  );
}

function QuestionCard({ q, answer, reveal, onPick }) {
  const locked = !!answer || reveal;

  return (
    <article className="qz-card">
      <div className="qz-tags">
        <span className="qz-tag">{TOPICS[q.topic]}</span>
        <span className="qz-tag subtle">{KIND_LABEL[q.kind]}</span>
      </div>
      <h2 className="qz-prompt">{q.prompt}</h2>

      {q.kind === "bug" ? (
        <>
          {!reveal && <p className="qz-muted">Tap the line with the bug.</p>}
          <CodeLines
            code={q.code}
            onLine={locked ? undefined : onPick}
            picked={answer?.picked}
            bugLine={reveal ? q.bugLine : undefined}
          />
          {reveal && (
            <div className="qz-fixed">
              <p className="qz-label">Fixed version</p>
              <CodeBlock code={q.fixedCode} />
            </div>
          )}
        </>
      ) : (
        <>
          {q.code && <CodeBlock code={q.code} />}
          <div className="qz-options">
            {q.options.map((opt, i) => {
              let cls = "qz-option";
              if (reveal && i === q.answer) cls += " right";
              else if (reveal && answer?.picked === i) cls += " wrong";
              else if (!reveal && answer?.picked === i) cls += " chosen";
              return (
                <button key={i} className={cls} disabled={locked} onClick={() => onPick(i)}>
                  <span className="qz-letter">{String.fromCharCode(65 + i)}</span>
                  <code>{opt}</code>
                </button>
              );
            })}
          </div>
        </>
      )}

      {reveal && (
        <div className={answer?.correct ? "qz-feedback ok" : "qz-feedback no"}>
          <p className="qz-verdict">{answer ? (answer.correct ? "Correct" : "Not quite") : "Not answered"}</p>
          <p>{q.explanation}</p>
          <p className="qz-sayit">
            <strong>Say it in the interview:</strong> &ldquo;{q.sayIt}&rdquo;
          </p>
        </div>
      )}
    </article>
  );
}

function Tokens({ tokens }) {
  if (tokens.length === 0) return " ";
  return tokens.map((t, i) => (
    <span key={i} className={`tk-${t.cls}`}>
      {t.text}
    </span>
  ));
}

function CodeBlock({ code }) {
  return (
    <pre className="qz-code">
      {highlightCSharp(code).map((tokens, i) => (
        <div key={i}>
          <Tokens tokens={tokens} />
        </div>
      ))}
    </pre>
  );
}

function CodeLines({ code, onLine, picked, bugLine }) {
  const lines = code.split("\n");
  const highlighted = highlightCSharp(code);
  return (
    <div className="qz-code qz-lines">
      {lines.map((text, i) => {
        const n = i + 1;
        let cls = "qz-line";
        if (bugLine === n) cls += " bug";
        else if (picked === n) cls += bugLine ? " wrong" : " chosen";
        return (
          <button key={n} className={cls} disabled={!onLine || !text.trim()} onClick={() => onLine?.(n)}>
            <span className="qz-ln">{n}</span>
            <span className="qz-lt">
              <Tokens tokens={highlighted[i]} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

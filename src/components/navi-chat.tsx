"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { liveApi, type NaviSource } from "@/lib/live-api";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  options?: string[];
  sources?: NaviSource[];
};

const welcome: Message = {
  id: "welcome",
  role: "assistant",
  content: "Ayubowan, I’m NAVI. I can help you plan hotels, tours, transfers, flights and visa requests. What would you like to arrange?",
  options: ["Plan a Sri Lanka trip", "Find a hotel", "Arrange a transfer", "Visa assistance"],
};

const storageKey = "navigeto:navi:messages";

export function NaviChat({ embedded = false }: { embedded?: boolean }) {
  const [open, setOpen] = useState(embedded);
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const streamRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || "[]") as Message[];
      if (Array.isArray(saved) && saved.length) setMessages(saved.slice(-20));
    } catch {
      sessionStorage.removeItem(storageKey);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    sessionStorage.setItem(storageKey, JSON.stringify(messages.slice(-20)));
  }, [messages, ready]);

  useEffect(() => {
    if (!open && !embedded) return;
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open, embedded]);

  useEffect(() => {
    if (open && !embedded) window.setTimeout(() => inputRef.current?.focus(), 80);
  }, [open, embedded]);

  async function send(raw: string) {
    const content = raw.trim();
    if (!content || loading) return;
    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content };
    const prior = messages.slice(-8).map(({ role, content: text }) => ({ role, content: text }));
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const response = await liveApi.assistant({ message: content, history: prior });
      setMessages((current) => [...current, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.reply,
        options: response.options,
        sources: response.sources,
      }]);
    } catch (error) {
      setMessages((current) => [...current, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: error instanceof Error
          ? error.message
          : "I’m unable to reply just now. Please try again or speak with our travel team.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(input);
  }

  function reset() {
    setMessages([welcome]);
    sessionStorage.removeItem(storageKey);
    inputRef.current?.focus();
  }

  const chat = <section
    className={`navi-panel${embedded ? " navi-panel-embedded" : ""}`}
    role={embedded ? "region" : "dialog"}
    aria-modal={embedded ? undefined : true}
    aria-label="NAVI travel assistant"
  >
    <header className="navi-header">
      <div className="navi-avatar" aria-hidden="true">N</div>
      <div>
        <p>NAVI</p>
        <span><i /> Navigeto travel assistant</span>
      </div>
      <button type="button" className="navi-reset" onClick={reset}>New chat</button>
      {!embedded && <button type="button" className="navi-close" onClick={() => setOpen(false)} aria-label="Close NAVI chat">×</button>}
    </header>

    <div className="navi-stream" ref={streamRef} aria-live="polite">
      {messages.map((message) => <article className={`navi-message navi-message-${message.role}`} key={message.id}>
        <div>{message.content}</div>
        {message.sources?.length ? <div className="navi-sources">
          <small>Suggested Navigeto journeys</small>
          {message.sources.slice(0, 3).map((source) => <Link key={`${source.type}-${source.reference}`} href={source.url}>{source.label} <span>→</span></Link>)}
        </div> : null}
        {message.options?.length ? <div className="navi-options">
          {message.options.map((option) => <button type="button" key={option} onClick={() => void send(option)} disabled={loading}>{option}</button>)}
        </div> : null}
      </article>)}
      {loading && <div className="navi-typing" aria-label="NAVI is preparing a reply"><i /><i /><i /></div>}
    </div>

    <div className="navi-shortcuts">
      <Link href="/hotels">Hotels</Link>
      <Link href="/tours">Tours</Link>
      <Link href="/transfers">Transfers</Link>
      <Link href="/custom-trip">Full trip form</Link>
    </div>

    <form className="navi-compose" onSubmit={submit}>
      <input
        ref={inputRef}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Ask NAVI about your trip…"
        aria-label="Message NAVI"
        maxLength={1500}
        disabled={loading}
      />
      <button type="submit" aria-label="Send message" disabled={!input.trim() || loading}>↑</button>
    </form>
    <p className="navi-note">NAVI gives planning guidance. Live availability, fares and visa rules are confirmed in the relevant booking flow.</p>
  </section>;

  if (embedded) return chat;

  return <>
    {open && <button className="navi-backdrop" type="button" aria-label="Close NAVI chat" onClick={() => setOpen(false)} />}
    {open && chat}
    <button
      className="navi-launcher"
      type="button"
      onClick={() => setOpen((current) => !current)}
      aria-expanded={open}
      aria-label={open ? "Close NAVI travel assistant" : "Open NAVI travel assistant"}
    >
      <span aria-hidden="true">✦</span>
      <b>NAVI</b>
      <small>Plan my trip</small>
    </button>
  </>;
}

export function NaviAssistantPage() {
  return <section className="navi-page">
    <div className="shell navi-page-grid">
      <div className="navi-page-copy">
        <p className="eyebrow">Meet NAVI</p>
        <h1>Your Sri Lanka trip, clearer from the first message.</h1>
        <p className="lede">Describe the journey in your own words. NAVI will help organise the right next step using Navigeto’s published travel information.</p>
        <div className="navi-capabilities">
          <div><b>01</b><span><strong>Shape the route</strong><small>Dates, destinations, pace and interests.</small></span></div>
          <div><b>02</b><span><strong>Connect the essentials</strong><small>Hotels, transfers, tours, flights and visas.</small></span></div>
          <div><b>03</b><span><strong>Hand off with context</strong><small>Continue with a booking flow or a human specialist.</small></span></div>
        </div>
        <a className="button button-soft" href="https://wa.me/94774206166" target="_blank" rel="noreferrer">Speak with a travel specialist</a>
      </div>
      <NaviChat embedded />
    </div>
  </section>;
}

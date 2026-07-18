"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { isNaviPublicEnabled } from "@/lib/navi/feature-flag";
import { assistantReply } from "@/lib/travelos";
import { useSite } from "./SiteProvider";
import styles from "./NaviPublicWidget.module.css";

type Message = {
  role: "bot" | "user";
  text: string;
};

const OPENING_MESSAGE: Message = {
  role: "bot",
  text: "Hi! I’m NAVI, your Navigeto travel companion. Tell me where you would like to travel, your dates and the number of travellers.",
};

const DEFAULT_OPTIONS = [
  "Plan a Sri Lanka trip",
  "Find a tour",
  "Visa guidance",
  "Search hotels",
  "Airport transfer",
];

export function FloatingAssistant() {
  const { config } = useSite();
  const sessionId = useId();
  const endRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([OPENING_MESSAGE]);
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<string[]>(DEFAULT_OPTIONS);
  const [pending, setPending] = useState(false);
  const naviEnabled = isNaviPublicEnabled();

  const whatsappNumber = useMemo(
    () =>
      String(
        config.whatsapp_number ||
          process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
          "",
      ).replace(/\D/g, ""),
    [config.whatsapp_number],
  );

  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Hi Navigeto, I would like help planning my trip.",
      )}`
    : "/contact";

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, pending]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!config.assistant_enabled) return null;

  if (!naviEnabled) {
    return (
      <Link
        className="floating-assistant"
        href="/trip-assistant"
        aria-label="Open trip assistant"
      >
        <span>✦</span>
        <b>Plan my trip</b>
      </Link>
    );
  }

  async function send(value = input) {
    const text = value.trim();
    if (!text || pending) return;

    const recentHistory = messages.slice(-8);
    setMessages((current) => [...current, { role: "user", text }]);
    setInput("");
    setPending(true);

    try {
      const result = await assistantReply({
        message: text,
        session_id: `navi-web-${sessionId}`,
        history: recentHistory,
        channel: "public_web",
        page_url: window.location.pathname,
      });
      setMessages((current) => [
        ...current,
        { role: "bot", text: result.reply },
      ]);
      setOptions(result.options?.length ? result.options : DEFAULT_OPTIONS);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "bot",
          text: "I cannot reach Navigeto TravelOS right now. Your message has not been lost—please continue through WhatsApp or open the full trip request form.",
        },
      ]);
      setOptions([]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={`${styles.launcher} ${open ? styles.launcherHidden : ""}`}
        onClick={() => setOpen(true)}
        aria-label="Open NAVI travel assistant"
        aria-expanded={open}
        aria-controls="navi-public-panel"
      >
        <span className={styles.mascot} aria-hidden="true">
          🐆
        </span>
        <span className={styles.launcherText}>
          <strong>NAVI</strong>
          <span>Plan your journey</span>
        </span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            className={styles.overlay}
            onClick={() => setOpen(false)}
            aria-label="Close NAVI travel assistant"
          />
          <section
            id="navi-public-panel"
            className={styles.panel}
            aria-label="NAVI travel assistant"
          >
            <header className={styles.header}>
              <div className={styles.headerTop}>
                <div className={styles.identity}>
                  <span className={styles.mascot} aria-hidden="true">
                    🐆
                  </span>
                  <span className={styles.identityText}>
                    <strong>NAVI</strong>
                    <span>Navigeto AI Voyage Intelligence</span>
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.close}
                  onClick={() => setOpen(false)}
                  aria-label="Close NAVI"
                >
                  ×
                </button>
              </div>
              <div className={styles.status}>
                <span className={styles.statusDot} aria-hidden="true" />
                Connected to Navigeto TravelOS · Human handoff available
              </div>
            </header>

            <div className={styles.body}>
              <div className={styles.messages} aria-live="polite">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`${styles.messageRow} ${
                      message.role === "user" ? styles.messageRowUser : ""
                    }`}
                  >
                    <div
                      className={`${styles.bubble} ${
                        message.role === "user" ? styles.bubbleUser : ""
                      }`}
                    >
                      {message.text}
                      <div className={styles.meta}>
                        {message.role === "user" ? "You" : "NAVI · TravelOS"}
                      </div>
                    </div>
                  </div>
                ))}
                {pending ? (
                  <div className={styles.messageRow}>
                    <div className={styles.bubble}>
                      <span className={styles.typing} aria-label="NAVI is thinking">
                        <span />
                        <span />
                        <span />
                      </span>
                    </div>
                  </div>
                ) : null}
                <div ref={endRef} />
              </div>

              {options.length ? (
                <div className={styles.quickWrap}>
                  <div className={styles.quickLabel}>Quick actions</div>
                  <div className={styles.quickList}>
                    {options.map((option) => (
                      <button
                        type="button"
                        key={option}
                        className={styles.quick}
                        onClick={() => void send(option)}
                        disabled={pending}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <form
                className={styles.composer}
                onSubmit={(event) => {
                  event.preventDefault();
                  void send();
                }}
              >
                <div className={styles.inputRow}>
                  <textarea
                    className={styles.input}
                    rows={1}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask about a trip, tour, visa, hotel or transfer…"
                    aria-label="Message NAVI"
                  />
                  <button
                    type="submit"
                    className={styles.send}
                    disabled={pending || !input.trim()}
                    aria-label="Send message"
                  >
                    ↑
                  </button>
                </div>
                <div className={styles.footerActions}>
                  {whatsappNumber ? (
                    <a
                      className={styles.footerLink}
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Continue on WhatsApp
                    </a>
                  ) : (
                    <Link className={styles.footerLink} href={whatsappHref}>
                      Talk to a travel expert
                    </Link>
                  )}
                  <Link className={styles.footerLink} href="/trip-assistant">
                    Full planner
                  </Link>
                </div>
                <div className={styles.privacy}>
                  Share personal details only when needed for your inquiry.
                </div>
              </form>
            </div>
          </section>
        </>
      ) : null}
    </>
  );
}

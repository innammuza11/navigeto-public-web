import Image from "next/image";
import Link from "next/link";
import styles from "./about-me.module.css";

export function AboutMeSection({ compact = false }: { compact?: boolean }) {
  return (
    <section id="about-me" className={`section shell ${styles.section}`} aria-labelledby="about-me-heading">
      <div className={`${styles.card} ${compact ? styles.compact : ""}`}>
        <figure className={styles.portrait}>
          <Image
            src="/media/navigeto-about-me.jpg"
            alt="Innam Muzzammil at the Navigeto Travels exhibition stand"
            width={960}
            height={1280}
            sizes="(max-width: 700px) 90vw, 440px"
          />
          <figcaption>Navigeto Travels</figcaption>
        </figure>
        <div className={styles.copy}>
          <p className="eyebrow">About me</p>
          <div className={styles.identity}>
            <strong>Innam Muzzammil</strong>
            <span>Travel Entrepreneur | Wellness Tourism</span>
          </div>
          <h2 id="about-me-heading">Thirteen years in travel.<br />One connected vision.</h2>
          <p>I started my career as a sales executive. Today, I’m building my own TravelOS—bringing thirteen years of experience, knowledge and ambition into a system shaped by the industry I know.</p>
          {compact ? (
            <p>My vision is to connect the travel world through one system, with trust, transparency and professionalism at its heart.</p>
          ) : (
            <>
              <p>Those years have given me more than experience. They have given me a reason to build: to turn what I have learned into something useful for the people who make travel happen. TravelOS is where that knowledge meets my vision for what our industry can become.</p>
              <p>My ambition is to create the kind of system every travel agent dreams of—one that brings people, services and opportunities together, and makes working across the travel world simpler and more connected.</p>
              <p>At the heart of that ambition is a clear mission: to help build a sustainable, professional and trusted travel industry, where transparency guides the way we work and strong relationships support lasting growth.</p>
              <p>I began by selling journeys. Now, I’m building a way for the people behind those journeys to move forward together.</p>
            </>
          )}
          <div className={styles.actions}>
            <Link className="button button-gold" href={compact ? "/about#about-me" : "#enquire"}>
              {compact ? "Read my story" : "Let’s start a conversation"} <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

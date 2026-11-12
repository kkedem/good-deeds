"use client";

import { useState } from "react";

const deeds = [
  {
    title: "Send someone a note to say you appreciate them.",
    detail: "A few sincere words can stay with someone all day.",
    time: "2 minutes",
    icon: "✉",
  },
  {
    title: "Bring a colleague or neighbor their favorite drink.",
    detail: "A small surprise is a lovely way to say, “I thought of you.”",
    time: "5 minutes",
    icon: "☕",
  },
  {
    title: "Pick up a little litter on your next walk.",
    detail: "A kinder neighborhood starts with one small action.",
    time: "5 minutes",
    icon: "🌱",
  },
  {
    title: "Call someone you have not caught up with lately.",
    detail: "A familiar voice can make an ordinary day feel special.",
    time: "10 minutes",
    icon: "♡",
  },
];

const quickIdeas = [
  { icon: "☀", title: "Share a compliment", type: "KIND WORDS" },
  { icon: "♧", title: "Help a neighbor", type: "LEND A HAND" },
  { icon: "♡", title: "Check in on a friend", type: "STAY CONNECTED" },
];

export default function Home() {
  const [deedIndex, setDeedIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const deed = deeds[deedIndex];

  function chooseAnotherDeed() {
    setDeedIndex((current) => (current + 1) % deeds.length);
    setIsComplete(false);
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Good Deed home">
          <span className="brand-mark" aria-hidden="true">✳</span>
          <span>good deed</span>
        </a>
        <a className="topbar-link" href="#ideas">Explore ideas <span aria-hidden="true">↗</span></a>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> A LITTLE GOOD GOES A LONG WAY</p>
          <h1>Make today<br />a little <span>brighter.</span></h1>
          <p className="hero-description">
            You don&apos;t need a grand gesture to make a difference. Start with
            one small thing, and see where kindness takes you.
          </p>
          <a className="primary-button" href="#today">
            Find your good deed <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="sun-halo" />
          <div className="sun">✳</div>
          <span className="orbit orbit-one">♡</span>
          <span className="orbit orbit-two">✦</span>
          <span className="orbit orbit-three">·</span>
          <p className="art-note">little things<br />mean a lot</p>
        </div>
      </section>

      <section className="today-section" id="today">
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR MOMENT OF GOOD</p>
            <h2>A small idea for today</h2>
          </div>
          <span className="today-date">A GOOD PLACE TO START</span>
        </div>

        <article className={`deed-card${isComplete ? " deed-card-complete" : ""}`}>
          <div className="deed-icon" aria-hidden="true">{deed.icon}</div>
          <div className="deed-copy">
            <span className="deed-label">{isComplete ? "LOOK AT YOU, SPREADING GOOD" : "TODAY'S GOOD DEED"}</span>
            <h3>{isComplete ? "You made someone's day a little brighter." : deed.title}</h3>
            <p>{isComplete ? "Take a moment to enjoy that warm, good feeling." : deed.detail}</p>
            <span className="time-chip"><span aria-hidden="true">◷</span> {deed.time}</span>
          </div>
          <div className="deed-actions">
            <button
              className={`done-button${isComplete ? " done-button-active" : ""}`}
              type="button"
              onClick={() => setIsComplete((complete) => !complete)}
              aria-pressed={isComplete}
            >
              {isComplete ? "Done with love ✓" : "I did this"}
            </button>
            <button className="another-button" type="button" onClick={chooseAnotherDeed}>
              Try another idea <span aria-hidden="true">↻</span>
            </button>
          </div>
        </article>
      </section>

      <section className="ideas-section" id="ideas">
        <div className="section-heading ideas-heading">
          <div>
            <p className="eyebrow">KINDNESS, YOUR WAY</p>
            <h2>Good can look like anything</h2>
          </div>
          <p className="ideas-intro">Pick what feels right for you. Every little thing counts.</p>
        </div>
        <div className="ideas-grid">
          {quickIdeas.map((idea) => (
            <article className="idea-card" key={idea.title}>
              <span className="idea-icon" aria-hidden="true">{idea.icon}</span>
              <span className="idea-type">{idea.type}</span>
              <h3>{idea.title}</h3>
              <span className="idea-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark" aria-hidden="true">✳</span>
          <span>good deed</span>
        </a>
        <p>Small acts. Softer days. A little more good.</p>
        <span className="footer-heart" aria-hidden="true">made with ♡</span>
      </footer>
    </main>
  );
}

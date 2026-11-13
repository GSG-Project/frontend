import { Link } from "react-router-dom";
import "./Landing.css";

const CURRENT_YEAR = new Date().getFullYear();

const STEPS = [
  {
    title: "Choose your models",
    text: "Pick the two AI models you want to put side by side.",
  },
  {
    title: "Enter your prompt",
    text: "Write one prompt. Both models receive exactly the same text.",
  },
  {
    title: "Compare the responses",
    text: "Read both answers next to their latency, token usage and cost, when the provider reports it.",
  },
  {
    title: "Get an AI evaluation",
    text: "An independent AI judge scores each answer for accuracy, relevance, clarity and completeness, and explains its strengths and weaknesses.",
  },
  {
    title: "Save your experiments",
    text: "Every comparison is saved as an experiment you can open again from your history.",
  },
  {
    title: "Run experiments again",
    text: "Repeat the same experiment as often as you like. Each run is kept separately, so earlier results stay available.",
  },
];

const REASONS = [
  {
    title: "One prompt, a fair comparison",
    text: "Every model answers the same input, so the differences you see come from the models.",
  },
  {
    title: "See how the answers differ",
    text: "Full responses side by side make differences in content, depth and tone easy to spot.",
  },
  {
    title: "An independent judge",
    text: "A separate AI model rates every answer on the same four criteria and tells you why.",
  },
  {
    title: "Performance you can measure",
    text: "Latency, input and output tokens, and estimated cost, shown whenever they are available.",
  },
  {
    title: "A history you can return to",
    text: "Experiments and all of their runs stay in your account, ready to review later.",
  },
];

function PromptForkIllustration() {
  return (
    <svg className="landing-fork" viewBox="0 0 720 480" aria-hidden="true" focusable="false">
      <text className="landing-fork-label" x="8" y="222">prompt</text>
      <path className="landing-fork-trunk" d="M8 240 H232" />

      <path className="landing-fork-branch" d="M232 240 C300 240 300 128 368 128 H704" />
      <path className="landing-fork-branch" d="M232 240 C300 240 300 352 368 352 H704" />
      <circle className="landing-fork-node" cx="232" cy="240" r="6" />

      <text className="landing-fork-label" x="368" y="104">model A</text>
      <path className="landing-fork-line landing-fork-line-a" d="M368 160 H668" />
      <path className="landing-fork-line landing-fork-line-a" d="M368 184 H612" />
      <path className="landing-fork-line landing-fork-line-a" d="M368 208 H648" />

      <text className="landing-fork-label" x="368" y="328">model B</text>
      <path className="landing-fork-line landing-fork-line-b" d="M368 384 H640" />
      <path className="landing-fork-line landing-fork-line-b" d="M368 408 H684" />
      <path className="landing-fork-line landing-fork-line-b" d="M368 432 H596" />

      <path className="landing-fork-judge" d="M688 88 V456" />
      <text className="landing-fork-label landing-fork-label-judge" x="680" y="76" textAnchor="end">judge</text>
      <circle className="landing-fork-mark" cx="688" cy="128" r="5" />
      <circle className="landing-fork-mark" cx="688" cy="352" r="5" />
    </svg>
  );
}

export default function Landing({ user }) {
  const isSignedIn = Boolean(user);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <header className="landing-nav">
        <Link to="/" className="landing-logo">ModelJudge</Link>
        <nav className="landing-nav-links" aria-label="Page sections">
          <a href="#how-it-works">How it works</a>
          <a href="#why-modeljudge">Why ModelJudge</a>
        </nav>
        <div className="landing-nav-actions">
          {isSignedIn ? (
            <Link to="/compare" className="landing-btn landing-btn-primary landing-btn-small">Open ModelJudge</Link>
          ) : (
            <>
              <Link to="/login" className="landing-btn landing-btn-ghost landing-btn-small">Log In</Link>
              <Link to="/register" className="landing-btn landing-btn-primary landing-btn-small">Sign Up</Link>
            </>
          )}
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-inner">
            <div className="landing-hero-text">
              <p className="landing-wordmark">ModelJudge</p>
              <h1 id="landing-title" className="landing-headline">
                One prompt. Two models. A clear verdict.
              </h1>
              <p className="landing-lead">
                Send the same prompt to two AI models, read their answers side by side with their
                latency, tokens and cost, and get an independent AI evaluation that helps you decide
                which model fits your task.
              </p>
              <div className="landing-hero-actions">
                {isSignedIn ? (
                  <Link to="/compare" className="landing-btn landing-btn-primary">Start a comparison</Link>
                ) : (
                  <>
                    <Link to="/register" className="landing-btn landing-btn-primary">Get Started</Link>
                    <Link to="/login" className="landing-btn landing-btn-ghost">Log In</Link>
                  </>
                )}
              </div>
            </div>
            <PromptForkIllustration />
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="landing-section landing-steps-section" aria-labelledby="how-title">
          <div className="landing-container">
            <p className="landing-eyebrow">How it works</p>
            <h2 id="how-title" className="landing-section-title">From one prompt to an informed decision</h2>
            <ol className="landing-steps">
              {STEPS.map((step, index) => (
                <li key={step.title} className="landing-step">
                  <span className="landing-step-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="landing-step-title">{step.title}</h3>
                  <p className="landing-step-text">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Why ModelJudge */}
        <section id="why-modeljudge" className="landing-section landing-why-section" aria-labelledby="why-title">
          <div className="landing-container landing-why">
            <div className="landing-why-intro">
              <p className="landing-eyebrow landing-eyebrow-light">Why ModelJudge</p>
              <h2 id="why-title" className="landing-section-title landing-section-title-light">
                Choose a model on evidence, not on reputation
              </h2>
              {!isSignedIn && (
                <Link to="/register" className="landing-btn landing-btn-light">Create a free account</Link>
              )}
            </div>
            <dl className="landing-reasons">
              {REASONS.map((reason) => (
                <div key={reason.title} className="landing-reason">
                  <dt>{reason.title}</dt>
                  <dd>{reason.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div>
            <Link to="/" className="landing-footer-logo" aria-label="ModelJudge home">ModelJudge</Link>
            <p className="landing-footer-note">Compare AI models on the same prompt.</p>
          </div>
          <nav className="landing-footer-links" aria-label="Footer">
            <a href="#how-it-works">How it works</a>
            <a href="#why-modeljudge">Why ModelJudge</a>
            {isSignedIn ? (
              <Link to="/compare">Open ModelJudge</Link>
            ) : (
              <>
                <Link to="/login">Log In</Link>
                <Link to="/register">Sign Up</Link>
              </>
            )}
          </nav>
          <p className="landing-footer-copy">© {CURRENT_YEAR} ModelJudge</p>
        </div>
      </footer>
    </div>
  );
}

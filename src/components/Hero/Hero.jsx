"use client";

import { useSettings } from "@/context/SettingsContext";
import translations from "@/data/translations";

import "./Hero.css";

const Hero = () => {
  const { language } = useSettings();

  const text = translations[language].hero;

  return (
    <section className="hero" id="home">
      <div className="hero-container">
        <div className="hero-content">
          <p className="hero-eyebrow">
            {text.eyebrow}
          </p>

          <h1 className="hero-title">
            {text.titleBefore}
            <span> {text.titleHighlight}</span>
          </h1>

          <p className="hero-description">
            {text.description}
          </p>

          <div className="hero-actions">
            <a
              href="#projects"
              className="hero-button hero-button-primary"
            >
              {text.viewProjects}
            </a>

            <a
              href="/resume/resume.pdf"
              className="hero-button hero-button-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              {text.viewResume}
            </a>
          </div>

          <div className="hero-socials">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub ↗
            </a>

            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="terminal">
            <div className="terminal-header">
              <div className="terminal-buttons">
                <span className="terminal-button"></span>
                <span className="terminal-button"></span>
                <span className="terminal-button"></span>
              </div>

              <span className="terminal-title">
                fuzaimi@portfolio
              </span>
            </div>

            <div className="terminal-body">
              <div className="terminal-line">
                <span className="terminal-user">
                  fuzaimi@portfolio
                </span>

                <span className="terminal-symbol">:</span>
                <span className="terminal-path">~</span>
                <span className="terminal-symbol">$</span>

                <span className="terminal-command">
                  {text.terminal.whoami}
                </span>
              </div>

              <div className="terminal-output">
                <p>
                  <span className="terminal-key">
                    {text.terminal.nameLabel}
                  </span>{" "}
                  <span className="terminal-value">
                    {text.terminal.name}
                  </span>
                </p>

                <p>
                  <span className="terminal-key">
                    {text.terminal.roleLabel}
                  </span>{" "}
                  <span className="terminal-value">
                    {text.terminal.role}
                  </span>
                </p>
              </div>

              <div className="terminal-line terminal-command-gap">
                <span className="terminal-user">
                  fuzaimi@portfolio
                </span>

                <span className="terminal-symbol">:</span>
                <span className="terminal-path">~</span>
                <span className="terminal-symbol">$</span>

                <span className="terminal-command">
                  {text.terminal.focusCommand}
                </span>
              </div>

              <div className="terminal-output">
                {text.terminal.focus.map((item) => (
                  <p
                    key={item}
                    className="terminal-focus-item"
                  >
                    {item}
                  </p>
                ))}
              </div>

              <div className="terminal-line terminal-command-gap">
                <span className="terminal-user">
                  fuzaimi@portfolio
                </span>

                <span className="terminal-symbol">:</span>
                <span className="terminal-path">~</span>
                <span className="terminal-symbol">$</span>

                <span className="terminal-command">
                  {text.terminal.philosophyCommand}
                </span>
              </div>

              <div className="terminal-output terminal-quote">
                {text.terminal.philosophy.map((line) => (
                  <p key={line}>
                    {line}
                  </p>
                ))}
              </div>

              <div className="terminal-line terminal-command-gap">
                <span className="terminal-user">
                  fuzaimi@portfolio
                </span>

                <span className="terminal-symbol">:</span>
                <span className="terminal-path">~</span>
                <span className="terminal-symbol">$</span>

                <span className="terminal-cursor"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
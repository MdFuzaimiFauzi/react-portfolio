import "./Hero.css";

const Hero = () => {
  return (
    <section className="hero" id="home">
      <div className="hero-container">
        <div className="hero-content">
          <p className="hero-eyebrow">Software Engineer</p>

          <h1 className="hero-title">
            Building reliable software for
            <span> intelligent systems.</span>
          </h1>

          <p className="hero-description">
            I build software for industrial automation, real-time systems,
            data-driven applications, and intelligent engineering solutions.
          </p>

          <div className="hero-actions">
            <a href="#projects" className="hero-button hero-button-primary">
              View Projects
            </a>

            <a
              href="/resume/resume.pdf"
              className="hero-button hero-button-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Resume
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

                <span className="terminal-path">
                  ~
                </span>

                <span className="terminal-symbol">
                  $
                </span>

                <span className="terminal-command">
                  whoami
                </span>
              </div>

              <div className="terminal-output">
                <p>
                  <span className="terminal-key">
                    name:
                  </span>{" "}
                  <span className="terminal-value">
                    Fuzaimi Fauzi
                  </span>
                </p>

                <p>
                  <span className="terminal-key">
                    role:
                  </span>{" "}
                  <span className="terminal-value">
                    Software Engineer
                  </span>
                </p>
              </div>

              <div className="terminal-line terminal-command-gap">
                <span className="terminal-user">
                  fuzaimi@portfolio
                </span>

                <span className="terminal-symbol">
                  :
                </span>

                <span className="terminal-path">
                  ~
                </span>

                <span className="terminal-symbol">
                  $
                </span>

                <span className="terminal-command">
                  focus
                </span>
              </div>

              <div className="terminal-output">
                <p className="terminal-focus-item">
                  Automation
                </p>

                <p className="terminal-focus-item">
                  Semiconductor
                </p>

                <p className="terminal-focus-item">
                  Computer Vision
                </p>

                <p className="terminal-focus-item">
                  Web Development
                </p>

                <p className="terminal-focus-item">
                  Artificial Intelligence
                </p>
              </div>

              <div className="terminal-line terminal-command-gap">
                <span className="terminal-user">
                  fuzaimi@portfolio
                </span>

                <span className="terminal-symbol">
                  :
                </span>

                <span className="terminal-path">
                  ~
                </span>

                <span className="terminal-symbol">
                  $
                </span>

                <span className="terminal-command">
                  philosophy
                </span>
              </div>

              <div className="terminal-output terminal-quote">
                <p>
                  "Error is not a fallback.
                </p>

                <p>
                  It is a learning process."
                </p>
              </div>

              <div className="terminal-line terminal-command-gap">
                <span className="terminal-user">
                  fuzaimi@portfolio
                </span>

                <span className="terminal-symbol">
                  :
                </span>

                <span className="terminal-path">
                  ~
                </span>

                <span className="terminal-symbol">
                  $
                </span>

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
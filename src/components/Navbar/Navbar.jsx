"use client";

import { useState } from "react";

import { useSettings } from "@/context/SettingsContext";

import "./Navbar.css";

const Navbar = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {
    theme,
    language,
    toggleTheme,
    toggleLanguage,
  } = useSettings();

  const navItems = [
    {
      id: "about",
      en: "About",
      bm: "Tentang",
    },
    {
      id: "projects",
      en: "Projects",
      bm: "Projek",
    },
    {
      id: "skills",
      en: "Skills",
      bm: "Kemahiran",
    },
    {
      id: "contact",
      en: "Contact",
      bm: "Hubungi",
    },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setIsMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <a
          href="#home"
          className="navbar-logo"
          onClick={() => handleNavClick("home")}
        >
          Fuzaimi<span>.</span>
        </a>

        <div className="navbar-right">
          <nav
            className={`navbar-links ${
              isMenuOpen
                ? "navbar-links-open"
                : ""
            }`}
            aria-label="Main navigation"
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={
                  activeTab === item.id
                    ? "navbar-link active"
                    : "navbar-link"
                }
                onClick={() =>
                  handleNavClick(item.id)
                }
              >
                {item[language]}
              </a>
            ))}
          </nav>

          <div className="navbar-settings">
            {/* THEME SWITCH */}

            <div className="navbar-setting">
              <span className="navbar-setting-label">
                {theme === "dark" ? "☾" : "☀"}
              </span>

              <button
                type="button"
                className={`navbar-switch ${
                  theme === "light"
                    ? "navbar-switch-active"
                    : ""
                }`}
                onClick={toggleTheme}
                aria-label="Toggle light and dark mode"
                aria-pressed={theme === "light"}
              >
                <span className="navbar-switch-thumb" />
              </button>
            </div>

            {/* LANGUAGE SWITCH */}

            <div className="navbar-setting">
              <span className="navbar-language-label">
                EN
              </span>

              <button
                type="button"
                className={`navbar-switch ${
                  language === "bm"
                    ? "navbar-switch-active"
                    : ""
                }`}
                onClick={toggleLanguage}
                aria-label="Switch between English and Bahasa Melayu"
                aria-pressed={language === "bm"}
              >
                <span className="navbar-switch-thumb" />
              </button>

              <span className="navbar-language-label">
                BM
              </span>
            </div>
          </div>

          <button
            className="navbar-menu-button"
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            onClick={() =>
              setIsMenuOpen(
                (current) => !current
              )
            }
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
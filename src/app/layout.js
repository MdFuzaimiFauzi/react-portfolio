import "./globals.css";

import { SettingsProvider } from "@/context/SettingsContext";

export const metadata = {
  title: "Fuzaimi Fauzi | Software Engineer",
  description:
    "Software Engineer portfolio focused on industrial automation, intelligent systems, and modern web development.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}

  //"Fuzaimi Fauzi is a software engineer with a passion for research and development. I am specializes in building innovative solutions and exploring new technologies to drive progress in the field of software engineering.",

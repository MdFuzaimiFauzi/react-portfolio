import "./globals.css";

export const metadata = {
  title : "Fuzaimi Fauzi | R&D Software Engineer",
  description: 
  "Fuzaimi Fauzi is a software engineer with a passion for research and development. I am specializes in building innovative solutions and exploring new technologies to drive progress in the field of software engineering.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
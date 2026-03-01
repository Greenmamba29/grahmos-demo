import "./globals.css";

export const metadata = {
  title: "GrahmOS Demo",
  description: "Offline-First Industrial Resilience Layer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

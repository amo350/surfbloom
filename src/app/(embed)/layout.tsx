// src/app/(embed)/layout.tsx
import "../globals.css";

export const metadata = {
  title: "SurfBloom Chat",
  robots: "noindex, nofollow",
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden !bg-transparent">
      <style>{`html, body { background: transparent !important; margin: 0; padding: 0; }`}</style>
      {children}
    </div>
  );
}

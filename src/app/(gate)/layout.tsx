// Minimal layout for gate pages (prelaunch, early-access).
// Intentionally omits PublicNav and Footer so these pages
// own their full chrome against the dark hero background.
export default function GateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

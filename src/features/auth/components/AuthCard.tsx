import type { PropsWithChildren } from "react";

export function AuthCard({ children }: PropsWithChildren) {
  return <section className="auth-card">{children}</section>;
}

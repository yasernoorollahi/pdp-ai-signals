import type { PropsWithChildren } from 'react';

export function GlassCard({ children }: PropsWithChildren) {
  return (
    <section className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-panel backdrop-blur-xl md:p-6">
      {children}
    </section>
  );
}

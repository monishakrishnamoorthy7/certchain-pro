export default function Hero({ title, subtitle, eyebrow }) {
  return (
    <section className="border-b border-slate-900 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%)]">
      <div className="container-shell py-12">
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{eyebrow}</p>
        ) : null}
        <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">{title}</h1>
        {subtitle ? <p className="mt-4 max-w-2xl text-slate-400">{subtitle}</p> : null}
      </div>
    </section>
  );
}

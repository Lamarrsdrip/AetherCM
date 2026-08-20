export default function Logo({ compact=false }: { compact?: boolean }) {
  return <div className="brand" aria-label="Aether Capital Markets">
    <span className="brandMark">A</span>
    {!compact && <span><strong>Aether</strong><small>Capital Markets</small></span>}
  </div>
}

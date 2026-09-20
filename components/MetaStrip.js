export default function MetaStrip({ items, className = '' }) {
  return (
    <dl className={`meta-strip ${className}`.trim()}>
      {items.map(({ label, value, wide }) => (
        <div key={label} className={wide ? 'is-wide' : undefined}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

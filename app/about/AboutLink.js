// Every link on this page carries its underline at rest. On hover the accent rule draws itself over
// that underline from the left, and the arrow travels. No JavaScript: it is all CSS on .abt-link.
// Without an href it still reads as the same item, but does nothing and takes no arrow.
export default function AboutLink({ href, children, arrow = '↗', className = '', ...rest }) {
  const Tag = href ? 'a' : 'span';
  return (
    <Tag href={href} className={`abt-link${href ? '' : ' abt-link--inert'} ${className}`} {...rest}>
      <span className="abt-link__label">{children}</span>
      {href && arrow && (
        <span className="abt-link__arrow" aria-hidden="true">
          {arrow}
        </span>
      )}
    </Tag>
  );
}

'use client';

export default function Footer() {
  return (
    <footer>
      <div className="wrap wrap--wide">
        <span>© 2026 Manik Madaan</span>
        <span>
          {/* Shown, but not linked: contact gets its own page. */}
          <span>manikdesigns@yahoo.com</span>
          &nbsp;·&nbsp;
          <span>LinkedIn</span>
          &nbsp;·&nbsp;
          <button type="button" className="footer-cookies" onClick={() => window.openCookieSettings?.()}>
            Cookie settings
          </button>
        </span>
      </div>
    </footer>
  );
}

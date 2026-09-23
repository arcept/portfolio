import PrinciplesIndex from './PrinciplesIndex';
import PrinciplesDeck from './PrinciplesDeck';

// Two presentations of the same content (lenses-content.js): the index on wide screens, the deck
// on phones. Both are rendered and CSS shows one (.abt-principles__wide / __narrow in about.css),
// so the choice is made before paint with no flash; the hidden one is display:none, which also
// keeps it out of the accessibility tree.
export default function Principles() {
  return (
    <div className="abt-principles">
      <div className="abt-principles__wide">
        <PrinciplesIndex />
      </div>
      <div className="abt-principles__narrow">
        <PrinciplesDeck />
      </div>
    </div>
  );
}

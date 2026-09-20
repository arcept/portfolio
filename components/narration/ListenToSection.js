import { ListenButton } from './NarrationUI';
import { chapterIndexById, buildTimeline, formatTime } from './timeline.mjs';
import narration from '../../public/case-studies/placement-hub/narration/narration.json';

// "Listen to this part" for one section of the page, by chapter id (the section id and the chapter id are the
// same, e.g. "problem"). A Server Component so the label — including how long that part is — is in the page's
// HTML; the button itself is the client component in NarrationUI.js.

const timeline = buildTimeline(narration);

export default function ListenToSection({ id }) {
  const index = chapterIndexById(timeline, id);
  if (index < 0) return null;
  const chapter = timeline.chapters[index];
  return <ListenButton index={index} label={chapter.label} length={formatTime(chapter.end - chapter.start)} />;
}

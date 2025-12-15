import type { CourseDocument } from '@/lib/docs';

const accentClass: Record<CourseDocument['accent'], string> = {
  horizon: 'accent-horizon',
  ember: 'accent-ember',
  aqua: 'accent-aqua'
};

type Props = {
  doc: CourseDocument;
};

export default function DocumentCard({ doc }: Props) {
  return (
    <article className={['doc-card', accentClass[doc.accent]].join(' ')}>
      <header>
        <p className="eyebrow">GlueRatGlobal · {doc.slug.replace(/-/g, ' ')}</p>
        <h2>{doc.title}</h2>
        <p className="subtitle">{doc.subtitle}</p>
      </header>
      <p className="excerpt">{doc.excerpt}</p>
      <details>
        <summary>Read the full document</summary>
        <div className="markdown" dangerouslySetInnerHTML={{ __html: doc.html }} />
      </details>
    </article>
  );
}

import DocumentCard from '@/components/DocumentCard';
import { getDocuments } from '@/lib/docs';

export default async function HomePage() {
  const documents = await getDocuments();

  return (
    <main className="shell">
      <div className="plasma" aria-hidden />
      <div className="grid">
        <header className="hero">
          <p className="badge">GlueRatGlobal · Max for Live</p>
          <h1>Collarts, meet your sonic playground.</h1>
          <p>
            We distilled the three essential course documents into an immersive reader so the
            cohort can focus on prototyping, not sifting through files. Crack open each card to
            dive into the story, outline, and ramp-up plan. (Agent chatter stays in the vault.)
          </p>
          <div className="actions">
            <a className="action" href="#docs">Browse the docs</a>
            <a className="action ghost" href="mailto:hello@gluerat.global">Ping the curator</a>
          </div>
        </header>

        <section id="docs" className="docs">
          {documents.map((doc) => (
            <DocumentCard key={doc.slug} doc={doc} />
          ))}
        </section>
      </div>
    </main>
  );
}

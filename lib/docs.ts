import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';

const manifest = [
  {
    slug: 'why-this-course',
    filename: '01_Why_This_Course_Exists.md',
    title: 'Why This Course Exists',
    subtitle: 'Setting the spark for the GlueRatGlobal cohort',
    accent: 'horizon'
  },
  {
    slug: 'course-outline',
    filename: '02_Course_Outline_Skeleton.md',
    title: 'Course Outline Skeleton',
    subtitle: 'A scaffold for experimentation and performance',
    accent: 'ember'
  },
  {
    slug: 'weeks-one-to-three',
    filename: '03_Weeks_1_to_3_Ramp.md',
    title: 'Weeks 1–3 Ramp',
    subtitle: 'Momentum exercises for creative technologists',
    accent: 'aqua'
  }
] as const;

marked.setOptions({
  gfm: true
});

const rootDir = process.cwd();

type ManifestEntry = (typeof manifest)[number];

export type CourseDocument = ManifestEntry & {
  html: string;
  excerpt: string;
};

const cleanLine = (line: string) => line.replace(/^#+\s*/, '').replace(/[`*_>#-]/g, '').trim();

const getExcerpt = (markdown: string) => {
  const lines = markdown.split('\n');
  const firstMeaningful = lines.find((line) => cleanLine(line).length > 0) ?? '';
  return cleanLine(firstMeaningful);
};

export async function getDocuments(): Promise<CourseDocument[]> {
  return Promise.all(
    manifest.map(async (doc) => {
      const filePath = path.join(rootDir, doc.filename);
      const raw = await fs.readFile(filePath, 'utf-8');
      const html = await marked.parse(raw);
      return {
        ...doc,
        html,
        excerpt: getExcerpt(raw)
      };
    })
  );
}

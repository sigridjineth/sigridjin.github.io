import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div>
      <h1 className="text-base font-semibold mb-4">about</h1>
      <div className="space-y-4 text-xs">
        <p>
          Hi, I&apos;m sigridjin. I&apos;m a software engineer.
        </p>
        <p>
          This blog is where I share long-form thoughts, quick learnings, and interesting
          links I find around the web.
        </p>
        <p>
          Built with Next.js, MDX, and Tailwind CSS. Source on{" "}
          <a href="https://github.com/sigridjineth/sigridjin.github.io">GitHub</a>.
        </p>
      </div>
    </div>
  );
}

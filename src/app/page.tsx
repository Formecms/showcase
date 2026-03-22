import { getPage } from "@/lib/content";
import { SectionRenderer } from "@/components/sections/section-renderer";

export const revalidate = 60;

export default async function HomePage() {
  const page = await getPage("home");

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ocean-950">
        <div className="text-center max-w-lg mx-auto px-6">
          <h1 className="font-display text-4xl text-sand-50 mb-4">Welcome to Forme Showcase</h1>
          <p className="text-sand-400 mb-8">
            No content found. Run the seed script to populate your Forme instance with showcase
            content:
          </p>
          <pre className="bg-ocean-900 text-sand-300 p-4 rounded-md text-sm text-left overflow-x-auto">
            <code>pnpm seed</code>
          </pre>
        </div>
      </div>
    );
  }

  return <SectionRenderer sections={page.sections} includes={page.includes} />;
}

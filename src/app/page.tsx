
import HomeList from "@/components/home-list";
import { BlogAside } from "@/components/portfolio-link";

export default async function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col text-neon-green-50">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <HomeList/>
            </div>
            <aside className="lg:col-span-4 space-y-8">
              
              <BlogAside />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

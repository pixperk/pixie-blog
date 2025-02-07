
import HomeList from "@/components/home-list";
import { PortfolioLink } from "@/components/portfolio-link";

export default async function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-emerald-50">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <HomeList/>
            </div>
            <aside className="lg:col-span-4 space-y-8">
              <div className="rounded-lg border border-emerald-800 p-6 bg-emerald-900/20 shadow-lg">
                <h2 className="text-xl font-semibold text-emerald-400 mb-6">
                  Staff Picks
                </h2>
                
              </div>
              <PortfolioLink />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}


import BookmarksList from "@/components/bookmarked-list";
import { PortfolioLink } from "@/components/portfolio-link";

export default async function BookmarksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-emerald-50">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-emerald-400">
            Your Bookmarks
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <BookmarksList/>
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

import ProfileGrid from './components/ProfileGrid.tsx';
import FilterSidebar from './components/FilterSidebar.tsx';
import { useState } from 'react';
import { useProfiles } from './contexts/ProfilesContext';
import { signOut } from './utilities/firebase.ts';
// import ProfilePage from './components/ProfilePage.tsx';

export default function App() {
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);

  const { profiles, isLoading, error } = useProfiles();

  if (error) return <h1>Error loading user data: {`${error}`}</h1>;
  if (isLoading) return <h1>Loading user data...</h1>;
  if (!profiles) return <h1>No user data found</h1>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Topbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-b from-white to-white/98 px-5 py-5 shadow-sm">
        <div>
          <h1 className="m-0 text-xl font-semibold">MealEx</h1>
          <p className="m-0 mt-0.5 text-xs text-slate-500">
            Network with peers over meals
          </p>
        </div>
        <div className='flex gap-2'>
          <button className="rounded-lg border border-blue-600 bg-transparent px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50">
            Manage
          </button>
          <button onClick={signOut} className="rounded-lg border border-blue-600 bg-transparent px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50">
            Log Out
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        <FilterSidebar
          selectedMajors={selectedMajors}
          setSelectedMajors={setSelectedMajors}
          selectedYears={selectedYears}
          setSelectedYears={setSelectedYears}
        />

        <main className="flex-1">
          {/* Main container */}
          <div className="mx-auto max-w-6xl px-5 py-7">
            {/* Intro section */}
            <section className="mb-8">
              <h2 className="m-0 text-2xl font-semibold">Browse profiles</h2>
              <p className="mt-1 text-slate-600">
                Find peers by major, year, and interests.
              </p>
            </section>

            {/* Cards grid */}
            <ProfileGrid
              selectedMajors={selectedMajors}
              selectedYears={selectedYears}
              profiles={profiles}
            />

            {/* Footer */}
            <footer className="mt-16 text-xs text-slate-600">
              {/* <p>
                Static mock — no functionality. Cards are intended to become
                reusable React components later.
              </p> */}
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

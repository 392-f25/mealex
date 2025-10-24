import ProfileGrid from './components/ProfileGrid.tsx'
import FilterSidebar from './components/FilterSidebar.tsx';
import { useState } from 'react';

export default function App() {
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  
  const profiles = [
    {
      id: 1,
      initials: 'AB',
      name: 'Alice Brown',
      major: 'Computer Science',
      year: '2028',
      bio: 'Interested in AI research and internships.',
      tags: ['AI', 'Internships']
    },
    {
      id: 2,
      initials: 'BM',
      name: 'Ben Martinez',
      major: 'Economics',
      year: '2026',
      bio: 'Interested in consulting and finance events.',
      tags: ['Consulting', 'Finance']
    },
    {
      id: 3,
      initials: 'CK',
      name: 'Chris Kim',
      major: 'Electrical Engineering',
      year: '2027',
      bio: 'Hardware design and embedded systems.',
      tags: ['Hardware', 'Embedded']
    },
    {
      id: 4,
      initials: 'DL',
      name: 'Dana Lee',
      major: 'Mathematics',
      year: '2025',
      bio: 'Enjoys tutoring and research in applied math.',
      tags: ['Research', 'Tutoring']
    },
    {
      id: 5,
      initials: 'ES',
      name: 'Evan Smith',
      major: 'Computer Science',
      year: '2026',
      bio: 'Full-stack dev, open-source contributor.',
      tags: ['Full-stack', 'Open-source']
    },
    {
      id: 6,
      initials: 'FG',
      name: 'Fiona Green',
      major: 'Journalism',
      year: '2028',
      bio: 'Interested in media, writing, and communications.',
      tags: ['Media', 'Writing']
    },
    {
      id: 7,
      initials: 'GT',
      name: 'George Thompson',
      major: 'Mechanical Engineering',
      year: '2025',
      bio: 'Robotics club lead, loves prototyping.',
      tags: ['Robotics', 'Prototyping']
    },
    {
      id: 8,
      initials: 'HL',
      name: 'Hannah Li',
      major: 'Biology',
      year: '2027',
      bio: 'Lab experience, pre-med track.',
      tags: ['Lab', 'Pre-med']
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Topbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-b from-white to-white/98 px-5 py-5 shadow-sm">
        <div>
          <h1 className="m-0 text-xl font-semibold">MealEx</h1>
          <p className="m-0 mt-0.5 text-xs text-slate-500">Network with peers over meals</p>
        </div>
        <button className="rounded-lg border border-blue-600 bg-transparent px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50">
          Manage
        </button>
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
              <p className="mt-1 text-slate-600">Find upperclassmen and peers by major, year, and interests.</p>
            </section>

            {/* Cards grid */}
            <ProfileGrid
              selectedMajors={selectedMajors}
              selectedYears={selectedYears}
              profiles={profiles}
            />

            {/* Footer */}
            <footer className="mt-16 text-xs text-slate-600">
              <p>Static mock — no functionality. Cards are intended to become reusable React components later.</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
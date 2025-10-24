import { useState } from 'react';

interface FilterSidebarProps {
  setSelectedMajors: (majors: string[]) => any;
  setSelectedYears: (years: string[]) => any;
  selectedMajors: string[];
  selectedYears: string[];
}

const FilterSidebar = ({ setSelectedMajors, setSelectedYears, selectedMajors, selectedYears }: FilterSidebarProps) => {
  const years = ['2025', '2026', '2027', '2028'];
  const majors = [
    'Computer Science',
    'Economics',
    'Electrical Engineering',
    'Mathematics',
    'Journalism',
    'Mechanical Engineering',
    'Biology',
  ];

  const handleYearChange = (year: string) => {
    if (selectedYears.includes(year)) {
      setSelectedYears(selectedYears.filter(y => y !== year));
    } else {
      setSelectedYears([...selectedYears, year]);
    }
  };

  const handleMajorChange = (major: string) => {
    if (selectedMajors.includes(major)) {
      setSelectedMajors(selectedMajors.filter(m => m !== major));
    } else {
      setSelectedMajors([...selectedMajors, major]);
    }
  };

  return (
    <aside className="w-70 bg-slate-50 border-r border-slate-200 p-5">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Year</h3>
        {years.map((year) => (
          <div key={year} className="flex items-center mb-2">
            <input
              onChange={() => handleYearChange(year)}
              checked={selectedYears.includes(year)}
              type="checkbox"
              id={`year-${year}`}
              name={year}
              className="mr-2"
            />
            <label htmlFor={`year-${year}`} className="text-sm text-slate-600">
              {year}
            </label>
          </div>
        ))}
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Major</h3>
        {majors.map((major) => (
          <div key={major} className="flex items-center mb-2">
            <input
              onChange={() => handleMajorChange(major)}
              checked={selectedMajors.includes(major)}
              type="checkbox"
              id={`major-${major}`}
              name={major}
              className="mr-2"
            />
            <label htmlFor={`major-${major}`} className="text-sm text-slate-600">
              {major}
            </label>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default FilterSidebar;
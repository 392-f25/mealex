import './FilterSidebar.css';

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
    <aside className="filter-sidebar">
      <div className="filter-group">
        <h3 className="filter-title">Year</h3>
        {years.map((year) => (
          <div key={year} className="filter-option">
            <input onChange={() => handleYearChange(year)} checked={selectedYears.includes(year)} type="checkbox" id={`year-${year}`} name={year} />
            <label htmlFor={`year-${year}`}>{year}</label>
          </div>
        ))}
      </div>
      <div className="filter-group">
        <h3 className="filter-title">Major</h3>
        {majors.map((major) => (
          <div key={major} className="filter-option">
            <input onChange={() => handleMajorChange(major)} checked={selectedMajors.includes(major)} type="checkbox" id={`major-${major}`} name={major} />
            <label htmlFor={`major-${major}`}>{major}</label>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default FilterSidebar;

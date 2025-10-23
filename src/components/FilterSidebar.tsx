import './FilterSidebar.css';

interface FilterSidebarProps {
  selectedMajors: string[];
  selectedYears: number[];
  onMajorChange: (majors: string[]) => void;
  onYearChange: (years: number[]) => void;
}

const FilterSidebar = ({ selectedMajors, selectedYears, onMajorChange, onYearChange }: FilterSidebarProps) => {

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

  return (
    <aside className="filter-sidebar">
      <div className="filter-group">
        <h3 className="filter-title">Year</h3>
        {years.map((year) => (
          <div key={year} className="filter-option">
            <input type="checkbox" id={`year-${year}`} name={year} />
            <label htmlFor={`year-${year}`}>{year}</label>
          </div>
        ))}
      </div>
      <div className="filter-group">
        <h3 className="filter-title">Major</h3>
        {majors.map((major) => (
          <div key={major} className="filter-option">
            <input type="checkbox" id={`major-${major}`} name={major} />
            <label htmlFor={`major-${major}`}>{major}</label>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default FilterSidebar;

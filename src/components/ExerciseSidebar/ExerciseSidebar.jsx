import React, { useState, useEffect } from 'react';
import ExerciseListItem from '../ExerciseListItem/ExerciseListItem';

const ExerciseSidebar = ({ onAddExercise, addedExerciseIds }) => {
  const [filters, setFilters] = useState({});
  const [filterOptionsData, setFilterOptionsData] = useState({
    muscleGroups: [],
    equipment: [],
    exerciseTypes: [],
    focus: []
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [exerciseLibrary, setExerciseLibrary] = useState([]);

  const handleFilterChange = (category, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [category]: prevFilters[category] === value ? null : value  // Toggle filter
    }));
    setActiveDropdown(null);
  };

  const handleRemoveFilter = (category) => {
    setFilters((prevFilters) => ({ ...prevFilters, [category]: null }));
  };

  const handleFilterButtonClick = (filterLabel) => {
    setActiveDropdown((prev) => (prev === filterLabel ? null : filterLabel));
  };

  const filterOptions = [
    { label: 'Muscle Group', options: filterOptionsData.muscleGroups },
    { label: 'Equipment', options: filterOptionsData.equipment },
    { label: 'Exercise Type', options: filterOptionsData.exerciseTypes },
    { label: 'Focus', options: filterOptionsData.focus },
  ];

  // Apply filters + search
  const filteredExercises = exerciseLibrary.filter((ex) => {
    return Object.entries(filters).every(([category, value]) => {
      if (!value) return true;

      const keyMap = {
        'Muscle Group': 'muscleGroup',
        'Equipment': 'equipment',
        'Exercise Type': 'type',
        'Focus': 'focus',
      };

      const exKey = keyMap[category];
      return ex[exKey]?.toLowerCase() === value.toLowerCase();
    }) && ex.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exerciseRes, filterRes] = await Promise.all([
          fetch('/api/exercises/all'),
          fetch('/api/exercises/filters')
        ]);

        const exerciseData = await exerciseRes.json();
        const filtersData = await filterRes.json();

        setExerciseLibrary(exerciseData);
        setFilterOptionsData(filtersData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, []);


  return (
    <div className="exercise-sidebar flex flex-col p-4 bg-gray-100 h-screen">
      {/* Search bar Section */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search exercises"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Applied Filters Section */}
      <div className="selected-filters mb-4 flex flex-wrap gap-2">
        {Object.entries(filters).map(([category, selectedOption]) => selectedOption && (
          <button
            key={`${category}-${selectedOption}`}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-2 rounded inline-flex items-center"
            onClick={() => handleRemoveFilter(category)}
          >
            {selectedOption} ✕
          </button>
        ))}
      </div>

      {/* Toggle Filter Dropdown Section */}
      <div className="filter-buttons mb-4 flex flex-wrap justify-center gap-4 w-full">
        {filterOptions.map((filter, index) => (
          <div key={filter.label} className="relative">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleFilterButtonClick(filter.label)}
            >
              {filter.label}
            </button>
            {activeDropdown === filter.label && (
              <div
                className={`absolute mt-2 bg-white border border-gray-300 rounded w-48 z-10 
            ${index !== 0 ? 'right-0' : 'left-0'}`}
              >
                {filter.options.map((option) => (
                  <button
                    key={option}
                    className={`p-2 hover:bg-gray-200 cursor-pointer block w-full text-left ${filters[filter.label] === option ? 'bg-gray-200' : ''
                      }`}
                    onClick={() => handleFilterChange(filter.label, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>


      {/* Custom Exercise Button */}
      <button className="mb-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
        + Create Custom Exercise
      </button>

      {/* Exercise List Section */}
      <div className="grid grid-cols-2 gap-4 overflow-y-auto">
        {filteredExercises.length > 0 ? (
          filteredExercises.map((ex) => (
            <ExerciseListItem
              key={ex.id}
              name={ex.name}
              onAdd={() => onAddExercise(ex)}
              isAdded={addedExerciseIds.includes(ex.id)}
            />
          ))
        ) : (
          <p className="text-gray-600 col-span-2">No exercises found. Try adjusting your filters.</p>
        )}
      </div>

    </div>

  );
};

export default ExerciseSidebar;

import React, { useState, useEffect, useRef } from 'react';
import ExerciseListItem from '../ExerciseListItem/ExerciseListItem';

const ExerciseModal = ({ onClose, onAddExercise, addedExerciseIds }) => {
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
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  const multiSelectCategories = ['Muscle Group', 'Equipment'];

  const handleFilterChange = (category, value) => {
    setFilters((prevFilters) => {
      if (multiSelectCategories.includes(category)) {
        const current = prevFilters[category] || [];
        return {
          ...prevFilters,
          [category]: current.includes(value)
            ? current.filter(v => v !== value)  // Remove if already selected
            : [...current, value]               // Add if not selected
        };
      } else {
        return {
          ...prevFilters,
          [category]: prevFilters[category] === value ? null : value  // Single-select toggle
        };
      }
    });
    setActiveDropdown(null);
  };

  const handleRemoveFilter = (category, option = null) => {
    setFilters((prevFilters) => {
      // Handle Multi-Select Categories
      if (multiSelectCategories.includes(category)) {
        const currentSelections = prevFilters[category] || [];

        const updatedSelections = currentSelections.filter(item => item !== option);

        return {
          ...prevFilters,
          [category]: updatedSelections
        };
      }

      // Handle Single-Select Categories
      return {
        ...prevFilters,
        [category]: null
      };
    });
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
      if (!value || (Array.isArray(value) && value.length === 0)) return true;

      const keyMap = {
        'Muscle Group': 'muscle_groups',
        'Equipment': 'equipment',
        'Exercise Type': 'type',
        'Focus': 'focus',
      };

      const exKey = keyMap[category];
      const exValue = ex[exKey];

      if (multiSelectCategories.includes(category)) {
        // For multi-select filters like Muscle Group & Equipment
        if (Array.isArray(exValue)) {
          return value.some(v => exValue.map(e => e.toLowerCase()).includes(v.toLowerCase()));
        } else {
          return value.includes(exValue);
        }
      } else {
        // Single-select filters
        return exValue?.toLowerCase() === value.toLowerCase();
      }
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
      } finally {
        setLoading(false);  // Stop loading regardless of success/failure
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="flex flex-col items-center justify-center bg-white/80 rounded-3xl shadow-2xl w-full max-w-5xl p-8 relative h-170" onClick={(e) => e.stopPropagation()}>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-400 text-2xl cursor-pointer"
        >
          ✖️
        </button>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-800 flex items-center justify-center gap-2">
          Select Your Exercise
        </h2>

        {/* Search Bar */}
        <div className="mb-6 w-full">
          <input
            type="text"
            placeholder="Search for an exercise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-300 focus:outline-none text-sm"
          />
        </div>

        {/* Active Filters */}
        {Object.values(filters).some(val => val && (Array.isArray(val) ? val.length > 0 : true)) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(filters).map(([category, selected]) => {
              if (!selected || (Array.isArray(selected) && selected.length === 0)) return null;

              if (Array.isArray(selected)) {
                return selected.map(option => (
                  <button
                    key={`${category}-${option}`}
                    className="flex items-center bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full hover:bg-purple-200 transition"
                    onClick={() => handleRemoveFilter(category, option)}
                  >
                    {option} <span className="ml-1">✕</span>
                  </button>
                ));
              }

              return (
                <button
                  key={`${category}-${selected}`}
                  className="flex items-center bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full hover:bg-purple-200 transition"
                  onClick={() => handleRemoveFilter(category)}
                >
                  {selected} <span className="ml-1">✕</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-3" ref={dropdownRef}>
          {filterOptions.map((filter, index) => (
            <div key={filter.label} className="relative">
              <button
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold py-2 px-4 rounded-full transition"
                onClick={() => handleFilterButtonClick(filter.label)}
              >
                {filter.label}
              </button>
              {activeDropdown === filter.label && (
                <div className="absolute mt-2 bg-white border border-gray-300 rounded-xl shadow-md w-40 z-20">
                  {filter.options.map(option => (
                    <button
                      key={option}
                      className={`w-full text-left text-sm px-4 py-2 hover:bg-gray-100 transition ${filters[filter.label] === option ? 'bg-blue-50 font-semibold' : ''
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

        {/* ➕ Custom Exercise */}
        <button className="mb-6 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-semibold py-2 px-4 rounded-full transition">
          + Create Custom Exercise
        </button>

        {/* Exercise List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full h-full overflow-y-auto pr-2">
          {loading ? (
            <p className="text-gray-400 text-sm col-span-2 text-center animate-pulse">
              Loading exercises...
            </p>
          ) : filteredExercises.length > 0 ? (
            filteredExercises.map((ex) => (
              <ExerciseListItem
                key={ex.id}
                ex={ex}
                onAdd={() => onAddExercise(ex)}
                isAdded={addedExerciseIds.includes(ex.id)}
              />
            ))
          ) : (
            <p className="text-gray-400 text-sm col-span-2 text-center">
              No exercises found. Adjust filters!
            </p>
          )}
        </div>

      </div>
    </div>

  );
}
export default ExerciseModal;

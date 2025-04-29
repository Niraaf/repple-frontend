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
  const [activeDropdown, setActiveDropdown] = useState(null); // { label: string, alignRight: boolean } | null
  const [searchQuery, setSearchQuery] = useState("");
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeDropdownRef = useRef(null);  // Ref for the open dropdown
  const activeTriggerRef = useRef(null);   // Ref for the button that opened it

  const multiSelectCategories = ['Muscle Group', 'Equipment'];

  const handleFilterChange = (category, value) => {
    setFilters((prevFilters) => {
      if (multiSelectCategories.includes(category)) {
        const current = prevFilters[category] || [];
        return {
          ...prevFilters,
          [category]: current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value]
        };
      } else {
        return {
          ...prevFilters,
          [category]: prevFilters[category] === value ? null : value
        };
      }
    });
    setActiveDropdown(null);
    activeTriggerRef.current = null;
  };

  const handleRemoveFilter = (category, option = null) => {
    setFilters((prevFilters) => {
      if (multiSelectCategories.includes(category)) {
        const currentSelections = prevFilters[category] || [];
        return {
          ...prevFilters,
          [category]: currentSelections.filter(item => item !== option)
        };
      }
      return {
        ...prevFilters,
        [category]: null
      };
    });
  };

  const handleFilterButtonClick = (filterLabel, event) => {
    if (activeDropdown?.label === filterLabel) {
      setActiveDropdown(null);
      activeTriggerRef.current = null;
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const alignRight = rect.left > screenWidth / 2;

      setActiveDropdown({ label: filterLabel, alignRight });
      activeTriggerRef.current = event.currentTarget;
    }
  };

  const filterOptions = [
    { label: 'Muscle Group', options: filterOptionsData.muscleGroups },
    { label: 'Equipment', options: filterOptionsData.equipment },
    { label: 'Exercise Type', options: filterOptionsData.exerciseTypes },
    { label: 'Focus', options: filterOptionsData.focus },
  ];

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

      if (!exValue) return false;

      if (multiSelectCategories.includes(category)) {
        if (Array.isArray(exValue)) {
          return value.some(v => exValue.map(e => e.toLowerCase()).includes(v.toLowerCase()));
        } else {
          return value.includes(exValue);
        }
      } else {
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
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!activeDropdownRef.current || activeTriggerRef.current?.contains(event.target)) {
        return;
      }
      if (!activeDropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
        activeTriggerRef.current = null;
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
      <div className="flex flex-col items-center bg-white/80 rounded-3xl shadow-2xl p-8 relative w-[90%] max-w-5xl h-[90%] animate-fade-in" onClick={(e) => e.stopPropagation()}>
        
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
          <div className="flex flex-wrap gap-2 mb-2">
            {Object.entries(filters).map(([category, selected]) => (
              Array.isArray(selected) ? (
                selected.map(option => (
                  <button
                    key={`${category}-${option}`}
                    className="flex items-center bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full hover:bg-purple-200 transition"
                    onClick={() => handleRemoveFilter(category, option)}
                  >
                    {option} <span className="ml-1">✕</span>
                  </button>
                ))
              ) : (
                <button
                  key={`${category}-${selected}`}
                  className="flex items-center bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full hover:bg-purple-200 transition"
                  onClick={() => handleRemoveFilter(category)}
                >
                  {selected} <span className="ml-1">✕</span>
                </button>
              )
            ))}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-4 mb-3 justify-center">
          {filterOptions.map((filter) => (
            <div key={filter.label} className="relative">
              <button
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold py-2 px-4 rounded-full transition"
                onClick={(e) => handleFilterButtonClick(filter.label, e)}
              >
                {filter.label}
              </button>

              {activeDropdown?.label === filter.label && (
                <div
                  ref={activeDropdownRef}
                  className={`absolute mt-2 bg-white border border-gray-300 rounded-xl shadow-md w-40 z-20 animate-fade-in ${activeDropdown.alignRight ? 'right-0' : 'left-0'}`}
                >
                  {filter.options.map(option => (
                    <button
                      key={option}
                      className={`w-full text-left text-sm px-4 py-2 hover:bg-gray-100 transition ${Array.isArray(filters[filter.label])
                        ? filters[filter.label]?.includes(option)
                        : filters[filter.label] === option
                        ? 'bg-blue-50 font-semibold'
                        : ''
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
        <button className="mb-6 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-semibold py-2 px-4 rounded-full transition">
          + Create Custom Exercise
        </button>

        {/* Exercise List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full overflow-y-auto">
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
};

export default ExerciseModal;

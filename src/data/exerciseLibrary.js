const exerciseLibrary = [
    // Chest
    { id: "ex-001", name: "Push-ups", muscleGroup: "Chest", equipment: "Bodyweight", type: "Compound", focus: "Strength", isCustom: false },
    { id: "ex-002", name: "Bench Press", muscleGroup: "Chest", equipment: "Barbell", type: "Compound", focus: "Strength", isCustom: false },
    { id: "ex-003", name: "Incline Dumbbell Press", muscleGroup: "Chest", equipment: "Dumbbell", type: "Compound", focus: "Hypertrophy", isCustom: false },
    { id: "ex-004", name: "Chest Fly", muscleGroup: "Chest", equipment: "Machine", type: "Isolation", focus: "Hypertrophy", isCustom: false },
  
    // Back
    { id: "ex-005", name: "Pull-ups", muscleGroup: "Back", equipment: "Bodyweight", type: "Compound", focus: "Strength", isCustom: false },
    { id: "ex-006", name: "Lat Pulldown", muscleGroup: "Back", equipment: "Machine", type: "Compound", focus: "Hypertrophy", isCustom: false },
    { id: "ex-007", name: "Barbell Row", muscleGroup: "Back", equipment: "Barbell", type: "Compound", focus: "Strength", isCustom: false },
    { id: "ex-008", name: "Dumbbell Row", muscleGroup: "Back", equipment: "Dumbbell", type: "Isolation", focus: "Hypertrophy", isCustom: false },
  
    // Legs
    { id: "ex-009", name: "Squats", muscleGroup: "Legs", equipment: "Bodyweight", type: "Compound", focus: "Strength", isCustom: false },
    { id: "ex-010", name: "Barbell Squat", muscleGroup: "Legs", equipment: "Barbell", type: "Compound", focus: "Strength", isCustom: false },
    { id: "ex-011", name: "Lunges", muscleGroup: "Legs", equipment: "Bodyweight", type: "Compound", focus: "Endurance", isCustom: false },
    { id: "ex-012", name: "Leg Press", muscleGroup: "Legs", equipment: "Machine", type: "Compound", focus: "Hypertrophy", isCustom: false },
    { id: "ex-013", name: "Romanian Deadlift", muscleGroup: "Legs", equipment: "Dumbbell", type: "Compound", focus: "Strength", isCustom: false },
    { id: "ex-014", name: "Calf Raises", muscleGroup: "Legs", equipment: "Bodyweight", type: "Isolation", focus: "Hypertrophy", isCustom: false },
  
    // Shoulders
    { id: "ex-015", name: "Overhead Press", muscleGroup: "Shoulders", equipment: "Barbell", type: "Compound", focus: "Strength", isCustom: false },
    { id: "ex-016", name: "Dumbbell Shoulder Press", muscleGroup: "Shoulders", equipment: "Dumbbell", type: "Compound", focus: "Hypertrophy", isCustom: false },
    { id: "ex-017", name: "Lateral Raises", muscleGroup: "Shoulders", equipment: "Dumbbell", type: "Isolation", focus: "Hypertrophy", isCustom: false },
    { id: "ex-018", name: "Face Pulls", muscleGroup: "Shoulders", equipment: "Cable", type: "Isolation", focus: "Mobility", isCustom: false },
  
    // Arms
    { id: "ex-019", name: "Bicep Curls", muscleGroup: "Arms", equipment: "Dumbbell", type: "Isolation", focus: "Hypertrophy", isCustom: false },
    { id: "ex-020", name: "Tricep Dips", muscleGroup: "Arms", equipment: "Bodyweight", type: "Compound", focus: "Strength", isCustom: false },
    { id: "ex-021", name: "Tricep Pushdown", muscleGroup: "Arms", equipment: "Cable", type: "Isolation", focus: "Hypertrophy", isCustom: false },
    { id: "ex-022", name: "Hammer Curls", muscleGroup: "Arms", equipment: "Dumbbell", type: "Isolation", focus: "Hypertrophy", isCustom: false },
  
    // Core
    { id: "ex-023", name: "Plank", muscleGroup: "Core", equipment: "Bodyweight", type: "Isometric", focus: "Endurance", isCustom: false },
    { id: "ex-024", name: "Crunches", muscleGroup: "Core", equipment: "Bodyweight", type: "Isolation", focus: "Hypertrophy", isCustom: false },
    { id: "ex-025", name: "Hanging Leg Raises", muscleGroup: "Core", equipment: "Pull-up Bar", type: "Isolation", focus: "Strength", isCustom: false },
    { id: "ex-026", name: "Russian Twists", muscleGroup: "Core", equipment: "Bodyweight", type: "Rotation", focus: "Endurance", isCustom: false },
  
    // Full Body / Other
    { id: "ex-027", name: "Deadlifts", muscleGroup: "Full Body", equipment: "Barbell", type: "Compound", focus: "Strength", isCustom: false },
    { id: "ex-028", name: "Burpees", muscleGroup: "Full Body", equipment: "Bodyweight", type: "Cardio", focus: "Endurance", isCustom: false },
    { id: "ex-029", name: "Kettlebell Swings", muscleGroup: "Full Body", equipment: "Kettlebell", type: "Compound", focus: "Conditioning", isCustom: false },
    { id: "ex-030", name: "Farmer's Carry", muscleGroup: "Full Body", equipment: "Dumbbell", type: "Carry", focus: "Strength", isCustom: false }
  ];
  
  export default exerciseLibrary;
  
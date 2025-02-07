import { Day, Preferences, Schedule, Subject, Turn } from '../types';

const MAX_COMBINATIONS = 500; // Reduced limit for better performance
const BATCH_SIZE = 50; // Number of combinations to generate at once
const MAX_SUBJECTS = 7; // Maximum number of subjects to process

const days: Day[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const turns: Turn[] = ['Mañana', 'Tarde', 'Noche'];

export function findMaxSubjectsCombination(subjects: Subject[], preferences: Preferences): {
  maxSubjects: number;
  schedules: Schedule[];
  selectedSubjects: string[];
} {
  // Only use visible subjects
  const visibleSubjects = subjects.filter(subject => !subject.hidden);
  
  // Early exit if no visible subjects
  if (visibleSubjects.length === 0) {
    return {
      maxSubjects: 0,
      schedules: [],
      selectedSubjects: []
    };
  }

  // Limit the number of subjects to process
  if (visibleSubjects.length > MAX_SUBJECTS) {
    console.warn(`Demasiadas materias visibles. Limitando a ${MAX_SUBJECTS} materias.`);
    visibleSubjects.length = MAX_SUBJECTS;
  }

  let maxSubjects = 0;
  let bestSchedules: Schedule[] = [];
  let bestSubjects: string[] = [];

  // Try combinations with decreasing number of subjects
  for (let targetSize = Math.min(MAX_SUBJECTS, visibleSubjects.length); targetSize > 0; targetSize--) {
    const combinations = generateCombinationsForSize(
      visibleSubjects,
      preferences,
      targetSize
    );

    if (combinations.length > 0) {
      maxSubjects = targetSize;
      bestSchedules = combinations;
      bestSubjects = Object.keys(combinations[0]);
      break;
    }
  }

  return {
    maxSubjects,
    schedules: bestSchedules,
    selectedSubjects: bestSubjects
  };
}

function generateCombinationsForSize(
  subjects: Subject[],
  preferences: Preferences,
  targetSize: number
): Schedule[] {
  const validSchedules: Schedule[] = [];
  const prioritySubjects = subjects.filter(s => s.priority);
  
  function isValidSchedule(schedule: Schedule): boolean {
    const usedSlots = new Set<string>();
    
    // Check blocked slots
    for (const { day, turn } of preferences.blockedSlots) {
      for (const subject of Object.keys(schedule)) {
        if (schedule[subject].day === day && schedule[subject].turn === turn) {
          return false;
        }
      }
    }
    
    for (const subject of Object.keys(schedule)) {
      const slot = `${schedule[subject].day}-${schedule[subject].turn}`;
      if (usedSlots.has(slot)) return false;
      usedSlots.add(slot);
    }
    
    // Check max subjects per day
    const subjectsPerDay = new Map<Day, number>();
    for (const { day } of Object.values(schedule)) {
      subjectsPerDay.set(day, (subjectsPerDay.get(day) || 0) + 1);
    }
    
    for (const count of subjectsPerDay.values()) {
      if (count > preferences.maxSubjectsPerDay) {
        return false;
      }
    }
    
    // Check for "sandwich" schedule
    const daySchedules = new Map<Day, Set<Turn>>();
    for (const { day, turn } of Object.values(schedule)) {
      if (!daySchedules.has(day)) {
        daySchedules.set(day, new Set());
      }
      daySchedules.get(day)?.add(turn);
    }
    
    for (const turns of daySchedules.values()) {
      if (!preferences.allowSandwich && turns.has('Mañana') && turns.has('Noche') && !turns.has('Tarde')) {
        return false;
      }
    }
    
    // Check if all priority subjects are included
    const includedSubjects = new Set(Object.keys(schedule));
    for (const subject of prioritySubjects) {
      if (!includedSubjects.has(subject.name)) {
        return false;
      }
    }
    
    return true;
  }

  function backtrack(currentSchedule: Schedule, index: number, size: number) {
    // If we haven't included all priority subjects and can't fit them in remaining slots, backtrack
    const includedPriorities = Object.keys(currentSchedule).filter(name => 
      prioritySubjects.some(s => s.name === name)
    ).length;
    const remainingSlots = targetSize - size;
    const remainingPriorities = prioritySubjects.length - includedPriorities;
    
    if (remainingPriorities > remainingSlots) {
      return;
    }
    
    if (size === targetSize) {
      if (isValidSchedule(currentSchedule)) {
        validSchedules.push({ ...currentSchedule });
      }
      return;
    }
    
    if (index >= subjects.length) return;

    // Try including this subject
    const subject = subjects[index];
    for (const day of days) {
      const availableTurns = subject.availability[day] || [];
      for (const { turn, isVirtual } of availableTurns) {
        currentSchedule[subject.name] = { 
          day, 
          turn,
          isVirtual
        };
        backtrack(currentSchedule, index + 1, size + 1);
        delete currentSchedule[subject.name];
      }
    }

    // Try skipping this subject
    backtrack(currentSchedule, index + 1, size);
  }

  backtrack({}, 0, 0);
  return validSchedules;
}

function generateCombinations(
  subjects: Subject[],
  preferences: Preferences,
  limit: number = BATCH_SIZE
): Schedule[] {
  // Early exit if no subjects
  if (subjects.length === 0) return [];

  // Limit the number of subjects to process
  if (subjects.length > MAX_SUBJECTS) {
    console.warn(`Demasiadas materias para generar todas las combinaciones. Limitando a ${MAX_SUBJECTS} materias.`);
    subjects = subjects.slice(0, MAX_SUBJECTS);
  }

  const validSchedules: Schedule[] = [];
  const prioritySubjects = subjects.filter(s => s.priority);
  
  function isValidSchedule(schedule: Schedule): boolean {
    const usedSlots = new Set<string>();
    
    // Check blocked slots
    for (const { day, turn } of preferences.blockedSlots) {
      for (const subject of Object.keys(schedule)) {
        if (schedule[subject].day === day && schedule[subject].turn === turn) {
          return false;
        }
      }
    }
    
    for (const subject of Object.keys(schedule)) {
      const slot = `${schedule[subject].day}-${schedule[subject].turn}`;
      if (usedSlots.has(slot)) return false;
      usedSlots.add(slot);
    }
    
    // Check max subjects per day
    const subjectsPerDay = new Map<Day, number>();
    for (const { day } of Object.values(schedule)) {
      subjectsPerDay.set(day, (subjectsPerDay.get(day) || 0) + 1);
    }
    
    for (const count of subjectsPerDay.values()) {
      if (count > preferences.maxSubjectsPerDay) {
        return false;
      }
    }
    
    // Check for "sandwich" schedule
    const daySchedules = new Map<Day, Set<Turn>>();
    for (const { day, turn } of Object.values(schedule)) {
      if (!daySchedules.has(day)) {
        daySchedules.set(day, new Set());
      }
      daySchedules.get(day)?.add(turn);
    }
    
    for (const turns of daySchedules.values()) {
      if (!preferences.allowSandwich && turns.has('Mañana') && turns.has('Noche') && !turns.has('Tarde')) {
        return false;
      }
    }
    
    // Check if all priority subjects are included
    const includedSubjects = new Set(Object.keys(schedule));
    for (const subject of prioritySubjects) {
      if (!includedSubjects.has(subject.name)) {
        return false;
      }
    }
    
    return true;
  }

  function backtrack(currentSchedule: Schedule, index: number): boolean {
    // Stop if we've found enough combinations
    if (validSchedules.length >= limit || validSchedules.length >= MAX_COMBINATIONS) {
      return true;
    }

    // If we haven't included all priority subjects and can't fit them in remaining slots, backtrack
    const includedPriorities = Object.keys(currentSchedule).filter(name => 
      prioritySubjects.some(s => s.name === name)
    ).length;
    const remainingSlots = subjects.length - index;
    const remainingPriorities = prioritySubjects.length - includedPriorities;
    
    if (remainingPriorities > remainingSlots) {
      return false;
    }
    
    if (index === subjects.length) {
      if (isValidSchedule(currentSchedule)) {
        validSchedules.push({ ...currentSchedule });
        return validSchedules.length >= limit;
      }
      return false;
    }

    const subject = subjects[index];
    for (const day of days) {
      const availableTurns = subject.availability[day] || [];
      for (const { turn, isVirtual } of availableTurns) {
        currentSchedule[subject.name] = { 
          day, 
          turn,
          isVirtual
        };
        if (backtrack(currentSchedule, index + 1)) return true;
        delete currentSchedule[subject.name];
      }
    }
    return false;
  }

  backtrack({}, 0);
  return validSchedules;
}

export function generateSchedules(
  subjects: Subject[],
  preferences: Preferences,
  limit: number = BATCH_SIZE
): Schedule[] {
  // Only use visible subjects
  const visibleSubjects = subjects.filter(subject => !subject.hidden);
  
  // Early exit if no visible subjects
  if (visibleSubjects.length === 0) return [];
  
  return generateCombinations(visibleSubjects, preferences, limit);
}
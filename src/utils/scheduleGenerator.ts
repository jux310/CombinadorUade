import { Day, Preferences, Schedule, Subject, Turn } from '../types';

const days: Day[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const turns: Turn[] = ['Mañana', 'Tarde', 'Noche'];

export function findMaxSubjectsCombination(subjects: Subject[], preferences: Preferences): {
  maxSubjects: number;
  schedules: Schedule[];
  selectedSubjects: string[];
} {
  const MAX_SUBJECTS = 7;
  let maxSubjects = 0;
  let bestSchedules: Schedule[] = [];
  let bestSubjects: string[] = [];

  // Try combinations with increasing number of subjects
  for (let targetSize = MAX_SUBJECTS; targetSize > 0; targetSize--) {
    const combinations = generateCombinationsForSize(
      subjects,
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

function generateCombinations(subjects: Subject[], preferences: Preferences): Schedule[] {
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
    
    // Check for "sandwich" schedule (morning and night classes without afternoon)
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

  function backtrack(currentSchedule: Schedule, index: number) {
    // If we haven't included all priority subjects and can't fit them in remaining slots, backtrack
    const includedPriorities = Object.keys(currentSchedule).filter(name => 
      prioritySubjects.some(s => s.name === name)
    ).length;
    const remainingSlots = subjects.length - index;
    const remainingPriorities = prioritySubjects.length - includedPriorities;
    
    if (remainingPriorities > remainingSlots) {
      return;
    }
    
    if (index === subjects.length) {
      if (isValidSchedule(currentSchedule)) {
        validSchedules.push({ ...currentSchedule });
      }
      return;
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
        backtrack(currentSchedule, index + 1);
        delete currentSchedule[subject.name];
      }
    }
  }

  backtrack({}, 0);
  return validSchedules;
}

export function generateSchedules(subjects: Subject[], preferences: Preferences): Schedule[] {
  if (subjects.length === 0) return [];
  const visibleSubjects = subjects.filter(subject => !subject.hidden);
  return generateCombinations(visibleSubjects, preferences);
}
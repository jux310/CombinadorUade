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
      bestSchedules = removeDuplicateSchedules(combinations);
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
  targetSize: number,
  maxCombinations: number = 1000
): Schedule[] {
  const validSchedules: Schedule[] = [];
  const prioritySubjects = subjects.filter(s => s.priority);
  
  function isValidSchedule(schedule: Schedule): boolean {
    const usedSlots = new Set<string>();
    const campusByDay = new Map<Day, string>();
    const subjectSlots = new Map<string, Set<string>>();
    
    // Check blocked slots
    for (const { day, turn } of preferences.blockedSlots) {
      for (const subject of Object.keys(schedule)) {
        if (schedule[subject].day === day && schedule[subject].turn === turn) {
          return false;
        }
      }
    }
    
    for (const subject of Object.keys(schedule)) {
      const { day, turn } = schedule[subject];
      const slot = `${day}-${turn}`;
      
      // Check if this subject already has this time slot
      if (!subjectSlots.has(subject)) {
        subjectSlots.set(subject, new Set());
      }
      if (subjectSlots.get(subject)!.has(slot)) {
        return false; // Same subject can't have same time slot twice
      }
      subjectSlots.get(subject)!.add(slot);
      
      // Check if any other subject has this time slot
      if (usedSlots.has(slot)) {
        // If another subject has this slot, it's invalid
        for (const [otherSubject, slots] of subjectSlots.entries()) {
          if (otherSubject !== subject && slots.has(slot)) {
            return false;
          }
        }
      }
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
    
    // Check single campus per day if enabled
    if (preferences.singleCampusPerDay) {
      for (const { day, campus } of Object.values(schedule)) {
        const existingCampus = campusByDay.get(day);
        if (existingCampus && existingCampus !== campus) {
          return false;
        }
        campusByDay.set(day, campus);
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
        if (validSchedules.length >= maxCombinations) {
          return true;
        }
      }
      return false;
    }
    
    if (index >= subjects.length) return false;

    // Try including this subject
    const subject = subjects[index];
    for (const day of days) {
      const courseInfos = subject.availability[day] || [];

      for (const { turn, campus } of courseInfos) {
        currentSchedule[subject.name] = { 
          day, 
          turn,
          campus
        };
        backtrack(currentSchedule, index + 1, size + 1);
        if (validSchedules.length >= maxCombinations) {
          return true;
        }
        delete currentSchedule[subject.name];
      }
    }

    // Try skipping this subject
    return backtrack(currentSchedule, index + 1, size);
  }

  backtrack({}, 0, 0);
  return removeDuplicateSchedules(validSchedules);
}

function scheduleToString(schedule: Schedule): string {
  return Object.entries(schedule)
    .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
    .map(([name, { day, turn, campus }]) => `${name}:${day}:${turn}:${campus}`)
    .join('|');
}

function removeDuplicateSchedules(schedules: Schedule[]): Schedule[] {
  const seen = new Set<string>();
  return schedules.filter(schedule => {
    const key = scheduleToString(schedule);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function generateCombinations(subjects: Subject[], preferences: Preferences): Schedule[] {
  const validSchedules: Schedule[] = [];
  const maxCombinations = 1000;
  const prioritySubjects = subjects.filter(s => s.priority);
  
  function isValidSchedule(schedule: Schedule): boolean {
    const usedSlots = new Set<string>();
    const campusByDay = new Map<Day, string>();
    
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
    
    // Check single campus per day if enabled
    if (preferences.singleCampusPerDay) {
      for (const { day, campus } of Object.values(schedule)) {
        const existingCampus = campusByDay.get(day);
        if (existingCampus && existingCampus !== campus) {
          return false;
        }
        campusByDay.set(day, campus);
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
        if (validSchedules.length >= maxCombinations) {
          return true;
        }
      }
      return false;
    }

    const subject = subjects[index];
    for (const day of days) {
      const courseInfos = subject.availability[day] || [];

      for (const { turn, campus } of courseInfos) {
        currentSchedule[subject.name] = { 
          day, 
          turn,
          campus
        };
        backtrack(currentSchedule, index + 1);
        if (validSchedules.length >= maxCombinations) {
          return true;
        }
        delete currentSchedule[subject.name];
      }
    }
    return false;
  }

  backtrack({}, 0);
  return removeDuplicateSchedules(validSchedules);
}

export function generateSchedules(subjects: Subject[], preferences: Preferences): Schedule[] {
  if (subjects.length === 0) return [];
  const visibleSubjects = subjects.filter(subject => !subject.hidden);
  return generateCombinations(visibleSubjects, preferences);
}
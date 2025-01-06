import { Day, Preferences, Schedule, Subject, Turn } from '../types';

const days: Day[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const turns: Turn[] = ['Mañana', 'Tarde', 'Noche'];

function generateCombinations(subjects: Subject[], preferences: Preferences): Schedule[] {
  const validSchedules: Schedule[] = [];
  
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
    
    return true;
  }

  function backtrack(currentSchedule: Schedule, index: number) {
    if (index === subjects.length) {
      if (isValidSchedule(currentSchedule)) {
        validSchedules.push({ ...currentSchedule });
      }
      return;
    }

    const subject = subjects[index];
    for (const day of days) {
      const availableTurns = subject.availability[day] || [];
      for (const turn of availableTurns) {
        currentSchedule[subject.name] = { day, turn };
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
  return generateCombinations(subjects, preferences);
}
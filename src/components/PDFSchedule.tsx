import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';
import { Schedule, PinamarCourse } from '../types';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  table: {
    display: 'table',
    width: 'auto',
    marginBottom: 30,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
  },
  tableCol: {
    width: '16.67%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
    textAlign: 'center',
  },
});

const days = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const turns = ['Mañana', 'Tarde', 'Noche'];

interface ScheduleSlot {
  day: string;
  turn: string;
  isVirtual?: boolean;
}

interface Props {
  schedules: Schedule[];
  subjects?: Subject[];
  pinamarCourses?: PinamarCourse[];
}

const getSubjectForSlot = (schedule: Schedule, day: string, turn: string): { name: string; campus: string } | null => {
  if (!schedule) return null;
  
  const entry = Object.entries(schedule).find(
    ([_, slot]) => slot.day === day && slot.turn === turn
  );
  
  const [name, { campus }] = entry;
  
  return {
    name,
    campus
  };
};

export const PDFSchedule = ({ schedules, pinamarCourses = [] }: Props) => {
  if (!Array.isArray(schedules) || schedules.length === 0) {
    throw new Error('Invalid schedules data');
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Horarios</Text>
        <Link src="https://uade.netlify.app/" style={styles.subtitle}>https://uade.netlify.app/</Link>
        {schedules.map((schedule, index) => {
          if (!schedule || typeof schedule !== 'object') {
            console.warn(`Invalid schedule at index ${index}`);
            return null;
          }

          return (
            <View key={index} wrap={false}>
              <Text style={{ fontSize: 14, marginBottom: 10 }}>Combinación {index + 1}</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  {days.map((day) => (
                    <View key={day} style={styles.tableCol}>
                      <Text style={styles.tableCell}>{day}</Text>
                    </View>
                  ))}
                </View>
                {turns.map((turn) => (
                  <View key={turn} style={styles.tableRow}>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>{turn}</Text>
                    </View>
                    {days.slice(1).map((day) => (
                      <View key={day} style={styles.tableCol}>
                        <Text style={styles.tableCell}>
                          {(() => {
                            try {
                              const subject = getSubjectForSlot(schedule, day, turn);
                              if (!subject) return '';
                              return `${subject.name} (${subject.campus})`;
                            } catch (error) {
                              console.warn(`Error rendering cell: ${day}-${turn}`, error);
                              return '';
                            }
                          })()}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          );
        }) || null}
        {pinamarCourses.length > 0 && (
          <View wrap={false}>
            <Text style={{ fontSize: 14, marginTop: 20, marginBottom: 10 }}>Materias en Sede Pinamar</Text>
            {pinamarCourses.map((course, index) => (
              <View key={index} style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{course.name}</Text>
                <Text style={{ fontSize: 10, color: '#666', marginTop: 4 }}>
                  Fechas: {course.dates}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};
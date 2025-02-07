import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';
import { Schedule } from '../types';

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

interface Props {
  schedules: Schedule[];
}

export const PDFSchedule = ({ schedules }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Horarios</Text>
      <Link src="https://uade.netlify.app/" style={styles.subtitle}>https://uade.netlify.app/</Link>
      {schedules.map((schedule, index) => (
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
                      {Object.entries(schedule).find(
                        ([_, slot]) => slot.day === day && slot.turn === turn
                      )?.[0] && `${Object.entries(schedule).find(
                        ([_, slot]) => slot.day === day && slot.turn === turn
                      )?.[0]}${Object.entries(schedule).find(
                        ([_, slot]) => slot.day === day && slot.turn === turn
                      )?.[1].isVirtual ? ' (V)' : ''}` || ''}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      ))}
    </Page>
  </Document>
);
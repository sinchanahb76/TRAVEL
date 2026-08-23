import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DayItinerary } from '../types';
import { ActivityCard } from './ActivityCard';

interface DayAccordionProps {
  day: DayItinerary;
  initialExpanded?: boolean;
  currencySymbol?: string;
  rateToUSD?: number;
}

export const DayAccordion: React.FC<DayAccordionProps> = ({
  day,
  initialExpanded = true,
  currencySymbol = '$',
  rateToUSD = 1,
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const dailyBudget = Math.round(day.dailyBudgetEstimateUSD * rateToUSD);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <View style={styles.dayBadge}>
            <Text style={styles.dayNumber}>DAY {day.dayNumber}</Text>
          </View>
          <View style={styles.titleWrapper}>
            <Text style={styles.title} numberOfLines={1}>
              {day.title}
            </Text>
            {day.dateStr ? <Text style={styles.dateText}>{day.dateStr}</Text> : null}
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.budgetPill}>
            <Text style={styles.budgetText}>
              ~{currencySymbol}
              {dailyBudget}
            </Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#a1a1aa"
            style={styles.arrowIcon}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          {day.summary ? <Text style={styles.summaryText}>{day.summary}</Text> : null}

          <View style={styles.activitiesList}>
            {day.activities.map((act) => (
              <ActivityCard
                key={act.id}
                activity={act}
                currencySymbol={currencySymbol}
                rateToUSD={rateToUSD}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#09090b',
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#18181b',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  dayBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '900',
    color: '#09090b',
    letterSpacing: 0.5,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fafafa',
  },
  dateText: {
    fontSize: 11,
    color: '#a1a1aa',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  budgetPill: {
    backgroundColor: '#27272a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  budgetText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
  },
  arrowIcon: {
    marginLeft: 4,
  },
  content: {
    padding: 16,
    backgroundColor: '#09090b',
  },
  summaryText: {
    fontSize: 13,
    color: '#d4d4d8',
    lineHeight: 19,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  activitiesList: {
    gap: 4,
  },
});

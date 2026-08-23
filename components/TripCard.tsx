import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ItineraryData } from '../types';

interface TripCardProps {
  trip: ItineraryData;
  onPress: () => void;
  onDelete: () => void;
  currencySymbol?: string;
  rateToUSD?: number;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  onPress,
  onDelete,
  currencySymbol = '$',
  rateToUSD = 1,
}) => {
  const totalCost = Math.round(trip.budgetBreakdown.totalEstimatedUSD * rateToUSD);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <View style={styles.daysBadge}>
            <Text style={styles.daysText}>{trip.numberOfDays} DAYS</Text>
          </View>
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>{trip.budgetTier.toUpperCase()}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={(e) => {
            onDelete();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <Text style={styles.destination}>{trip.destination}</Text>
      <Text style={styles.tagline} numberOfLines={2}>
        {trip.destinationTagline || trip.overview}
      </Text>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={14} color="#a1a1aa" />
          <Text style={styles.infoText}>
            {trip.startDate} — {trip.endDate}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="people-outline" size={14} color="#a1a1aa" />
          <Text style={styles.infoText}>{trip.travelers}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.costLabel}>Est. Budget</Text>
          <Text style={styles.costValue}>
            {currencySymbol}
            {totalCost}
          </Text>
        </View>

        <View style={styles.viewAction}>
          <Text style={styles.viewActionText}>Open Itinerary</Text>
          <Ionicons name="arrow-forward" size={14} color="#10b981" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181b',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  daysBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  daysText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#09090b',
  },
  tierBadge: {
    backgroundColor: '#27272a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38bdf8',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#450a0a33',
  },
  destination: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fafafa',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 13,
    color: '#a1a1aa',
    lineHeight: 18,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#27272a',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#d4d4d8',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  costLabel: {
    fontSize: 10,
    color: '#a1a1aa',
    textTransform: 'uppercase',
  },
  costValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10b981',
  },
  viewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10b981',
  },
});

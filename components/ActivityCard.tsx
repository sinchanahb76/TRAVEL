import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Activity } from '../types';

interface ActivityCardProps {
  activity: Activity;
  currencySymbol?: string;
  rateToUSD?: number;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  currencySymbol = '$',
  rateToUSD = 1,
}) => {
  const convertedCost = Math.round(activity.estimatedCostUSD * rateToUSD);

  const getSlotIcon = () => {
    switch (activity.timeSlot) {
      case 'morning':
        return { name: 'sunny-outline' as const, color: '#f59e0b', bg: '#78350f33' };
      case 'afternoon':
        return { name: 'partly-sunny-outline' as const, color: '#38bdf8', bg: '#0c4a6e33' };
      case 'evening':
        return { name: 'moon-outline' as const, color: '#a855f7', bg: '#581c8733' };
    }
  };

  const slotInfo = getSlotIcon();

  const handleOpenMap = () => {
    const query = encodeURIComponent(`${activity.locationName} ${activity.title}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.slotBadge, { backgroundColor: slotInfo.bg }]}>
          <Ionicons name={slotInfo.name} size={14} color={slotInfo.color} />
          <Text style={[styles.slotText, { color: slotInfo.color }]}>
            {activity.timeSlot.toUpperCase()}
          </Text>
        </View>

        <View style={styles.costBadge}>
          <Text style={styles.costText}>
            {convertedCost > 0 ? `${currencySymbol}${convertedCost}` : 'Free'}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>{activity.title}</Text>
      <Text style={styles.description}>{activity.description}</Text>

      <View style={styles.metaRow}>
        <TouchableOpacity style={styles.locationButton} onPress={handleOpenMap} activeOpacity={0.7}>
          <Ionicons name="location-sharp" size={14} color="#10b981" />
          <Text style={styles.locationText} numberOfLines={1}>
            {activity.locationName}
          </Text>
        </TouchableOpacity>

        <View style={styles.durationBadge}>
          <Ionicons name="time-outline" size={13} color="#a1a1aa" />
          <Text style={styles.durationText}>{activity.duration}</Text>
        </View>
      </View>

      {activity.insiderTip ? (
        <View style={styles.tipContainer}>
          <Ionicons name="bulb-outline" size={14} color="#eab308" style={styles.tipIcon} />
          <Text style={styles.tipText}>
            <Text style={styles.tipBold}>Insider Tip: </Text>
            {activity.insiderTip}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  slotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  slotText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  costBadge: {
    backgroundColor: '#27272a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  costText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f4f4f5',
    marginBottom: 6,
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    color: '#a1a1aa',
    lineHeight: 19,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
    backgroundColor: '#09090b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  locationText: {
    fontSize: 12,
    color: '#34d399',
    fontWeight: '600',
    flex: 1,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#09090b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  durationText: {
    fontSize: 12,
    color: '#a1a1aa',
    fontWeight: '500',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#42200633',
    borderWidth: 1,
    borderColor: '#ca8a0444',
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  tipIcon: {
    marginRight: 6,
    marginTop: 1,
  },
  tipText: {
    fontSize: 12,
    color: '#fef08a',
    lineHeight: 17,
    flex: 1,
  },
  tipBold: {
    fontWeight: '700',
    color: '#facc15',
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HiddenGem } from '../types';

interface HiddenGemCardProps {
  gem: HiddenGem;
}

export const HiddenGemCard: React.FC<HiddenGemCardProps> = ({ gem }) => {
  const handleOpenMap = () => {
    const query = encodeURIComponent(`${gem.name} ${gem.locationName}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.gemBadge}>
          <Ionicons name="diamond-outline" size={13} color="#ec4899" />
          <Text style={styles.gemBadgeText}>HIDDEN GEM</Text>
        </View>
        <TouchableOpacity style={styles.locateBtn} onPress={handleOpenMap} activeOpacity={0.7}>
          <Ionicons name="navigate-outline" size={12} color="#ec4899" />
          <Text style={styles.locateText}>Map</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.name}>{gem.name}</Text>
      <Text style={styles.description}>{gem.description}</Text>

      <View style={styles.specialBox}>
        <Ionicons name="sparkles" size={13} color="#f472b6" />
        <Text style={styles.specialText}>
          <Text style={styles.specialBold}>Why Special: </Text>
          {gem.whySpecial}
        </Text>
      </View>

      <View style={styles.timeBox}>
        <Ionicons name="time-outline" size={13} color="#a1a1aa" />
        <Text style={styles.timeText}>Best time: {gem.bestTimeToVisit}</Text>
      </View>
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
    borderColor: '#83184344',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#83184333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  gemBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#f472b6',
    letterSpacing: 0.5,
  },
  locateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#09090b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#83184344',
  },
  locateText: {
    fontSize: 11,
    color: '#f472b6',
    fontWeight: '700',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f4f4f5',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#a1a1aa',
    lineHeight: 18,
    marginBottom: 12,
  },
  specialBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#83184322',
    borderWidth: 1,
    borderColor: '#db277733',
    padding: 10,
    borderRadius: 12,
    gap: 6,
    marginBottom: 8,
  },
  specialText: {
    fontSize: 12,
    color: '#fbcfe8',
    flex: 1,
    lineHeight: 17,
  },
  specialBold: {
    fontWeight: '700',
    color: '#f472b6',
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#a1a1aa',
  },
});

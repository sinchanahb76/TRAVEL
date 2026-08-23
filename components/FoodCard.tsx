import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FoodSuggestion } from '../types';

interface FoodCardProps {
  food: FoodSuggestion;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food }) => {
  const handleOpenMap = () => {
    const query = encodeURIComponent(`${food.name} ${food.locationName}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.cuisineBadge}>
          <Text style={styles.cuisineText}>{food.cuisine}</Text>
        </View>
        <Text style={styles.priceRange}>{food.priceRange}</Text>
      </View>

      <Text style={styles.name}>{food.name}</Text>
      <Text style={styles.description}>{food.description}</Text>

      <View style={styles.dishBox}>
        <Ionicons name="restaurant-outline" size={14} color="#f59e0b" />
        <Text style={styles.dishText}>
          <Text style={styles.dishBold}>Must Try: </Text>
          {food.mustTryDish}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.vibeBadge}>
          <Ionicons name="sparkles-outline" size={12} color="#a855f7" />
          <Text style={styles.vibeText}>{food.vibe}</Text>
        </View>

        <TouchableOpacity style={styles.mapBtn} onPress={handleOpenMap} activeOpacity={0.7}>
          <Ionicons name="navigate-outline" size={12} color="#10b981" />
          <Text style={styles.mapBtnText}>Locate</Text>
        </TouchableOpacity>
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
    borderColor: '#27272a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cuisineBadge: {
    backgroundColor: '#09090b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  cuisineText: {
    fontSize: 11,
    color: '#38bdf8',
    fontWeight: '700',
  },
  priceRange: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10b981',
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
  dishBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#451a0333',
    borderWidth: 1,
    borderColor: '#d9770644',
    padding: 10,
    borderRadius: 12,
    gap: 6,
    marginBottom: 12,
  },
  dishText: {
    fontSize: 12,
    color: '#fed7aa',
    flex: 1,
  },
  dishBold: {
    fontWeight: '700',
    color: '#fb923c',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vibeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#581c8733',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vibeText: {
    fontSize: 11,
    color: '#d8b4fe',
    fontWeight: '500',
  },
  mapBtn: {
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
  mapBtnText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '700',
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HotelRecommendation } from '../types';

interface HotelCardProps {
  hotel: HotelRecommendation;
  currencySymbol?: string;
  rateToUSD?: number;
}

export const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  currencySymbol = '$',
  rateToUSD = 1,
}) => {
  const convertedPrice = Math.round(hotel.pricePerNightUSD * rateToUSD);

  const handleBooking = () => {
    const query = encodeURIComponent(`${hotel.name} ${hotel.locationName}`);
    const url = `https://www.google.com/travel/hotels?q=${query}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={13} color="#f59e0b" />
          <Text style={styles.ratingText}>{hotel.rating.toFixed(1)}</Text>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{hotel.priceCategory}</Text>
        </View>
      </View>

      <Text style={styles.name}>{hotel.name}</Text>
      <Text style={styles.description}>{hotel.description}</Text>

      <View style={styles.amenitiesContainer}>
        {hotel.amenities.map((amenity, idx) => (
          <View key={idx} style={styles.amenityChip}>
            <Ionicons name="checkmark-circle-outline" size={12} color="#10b981" />
            <Text style={styles.amenityText}>{amenity}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.priceLabel}>From</Text>
          <Text style={styles.priceValue}>
            {currencySymbol}
            {convertedPrice}
            <Text style={styles.perNight}> / night</Text>
          </Text>
        </View>

        <TouchableOpacity style={styles.bookButton} onPress={handleBooking} activeOpacity={0.7}>
          <Text style={styles.bookButtonText}>View Deals</Text>
          <Ionicons name="open-outline" size={14} color="#09090b" />
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#78350f33',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fbbf24',
  },
  categoryBadge: {
    backgroundColor: '#27272a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#d4d4d8',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f4f4f5',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: '#a1a1aa',
    lineHeight: 18,
    marginBottom: 12,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#09090b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  amenityText: {
    fontSize: 11,
    color: '#d4d4d8',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  priceLabel: {
    fontSize: 10,
    color: '#a1a1aa',
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10b981',
  },
  perNight: {
    fontSize: 11,
    color: '#a1a1aa',
    fontWeight: '400',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  bookButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#09090b',
  },
});

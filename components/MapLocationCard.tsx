import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MapLocationCardProps {
  destination: string;
  coordinates: { lat: number; lng: number };
  tagline?: string;
}

export const MapLocationCard: React.FC<MapLocationCardProps> = ({
  destination,
  coordinates,
  tagline,
}) => {
  const openInNativeMaps = () => {
    const query = encodeURIComponent(destination);
    const url = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}+(${query})`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="map" size={18} color="#10b981" />
        </View>
        <View style={styles.titleBox}>
          <Text style={styles.title}>{destination} Coordinates</Text>
          <Text style={styles.coordsText}>
            {coordinates.lat.toFixed(4)}° N, {coordinates.lng.toFixed(4)}° E
          </Text>
        </View>
      </View>

      {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}

      <TouchableOpacity style={styles.mapAction} onPress={openInNativeMaps} activeOpacity={0.8}>
        <Ionicons name="navigate-circle-outline" size={20} color="#09090b" />
        <Text style={styles.mapActionText}>Open in Google Maps / Navigation</Text>
        <Ionicons name="open-outline" size={16} color="#09090b" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181b',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#052e16',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#10b98144',
  },
  titleBox: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fafafa',
  },
  coordsText: {
    fontSize: 12,
    color: '#34d399',
    fontWeight: '600',
    marginTop: 2,
  },
  tagline: {
    fontSize: 13,
    color: '#a1a1aa',
    lineHeight: 18,
    marginBottom: 14,
    fontStyle: 'italic',
  },
  mapAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 8,
  },
  mapActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#09090b',
  },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeatherDay } from '../types';

interface WeatherForecastCardProps {
  forecast?: WeatherDay[];
}

export const WeatherForecastCard: React.FC<WeatherForecastCardProps> = ({ forecast }) => {
  if (!forecast || forecast.length === 0) return null;

  const getWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'sun':
        return { name: 'sunny' as const, color: '#f59e0b' };
      case 'cloud-sun':
        return { name: 'partly-sunny' as const, color: '#38bdf8' };
      case 'cloud':
        return { name: 'cloud' as const, color: '#94a3b8' };
      case 'rain':
        return { name: 'rainy' as const, color: '#60a5fa' };
      case 'thunder':
        return { name: 'thunderstorm' as const, color: '#a855f7' };
      case 'snow':
        return { name: 'snow' as const, color: '#e2e8f0' };
      default:
        return { name: 'sunny' as const, color: '#f59e0b' };
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="cloudy-night-outline" size={18} color="#38bdf8" />
          <Text style={styles.title}>Weather Forecast</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
        {forecast.map((day, idx) => {
          const iconConfig = getWeatherIcon(day.icon);
          return (
            <View key={idx} style={styles.dayItem}>
              <Text style={styles.dayName}>{day.dayName}</Text>
              <Text style={styles.dayDate}>{day.date}</Text>
              <Ionicons name={iconConfig.name} size={24} color={iconConfig.color} style={styles.icon} />
              <Text style={styles.tempC}>{day.tempC}°C</Text>
              <Text style={styles.tempF}>{day.tempF}°F</Text>
              <Text style={styles.condition} numberOfLines={1}>
                {day.condition}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {forecast[0]?.packingAdvice ? (
        <View style={styles.packingBox}>
          <Ionicons name="shirt-outline" size={14} color="#38bdf8" />
          <Text style={styles.packingText}>
            <Text style={styles.packingBold}>Packing Tip: </Text>
            {forecast[0].packingAdvice}
          </Text>
        </View>
      ) : null}
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
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f4f4f5',
  },
  scrollList: {
    gap: 10,
    paddingVertical: 4,
  },
  dayItem: {
    backgroundColor: '#09090b',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    minWidth: 85,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f4f4f5',
  },
  dayDate: {
    fontSize: 10,
    color: '#a1a1aa',
    marginBottom: 6,
  },
  icon: {
    marginVertical: 4,
  },
  tempC: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fafafa',
  },
  tempF: {
    fontSize: 11,
    color: '#71717a',
    marginBottom: 4,
  },
  condition: {
    fontSize: 10,
    color: '#38bdf8',
    fontWeight: '600',
  },
  packingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0369a122',
    borderWidth: 1,
    borderColor: '#0284c733',
    padding: 10,
    borderRadius: 12,
    gap: 6,
    marginTop: 12,
  },
  packingText: {
    fontSize: 12,
    color: '#bae6fd',
    flex: 1,
  },
  packingBold: {
    fontWeight: '700',
    color: '#38bdf8',
  },
});

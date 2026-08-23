import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FlightOffer } from '../types';

interface FlightCardProps {
  flight: FlightOffer;
  currencySymbol?: string;
  rateToUSD?: number;
}

export const FlightCard: React.FC<FlightCardProps> = ({
  flight,
  currencySymbol = '$',
  rateToUSD = 1,
}) => {
  const convertedPrice = Math.round(flight.price * rateToUSD);

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return isoString;
    }
  };

  const handleBooking = () => {
    if (flight.bookingUrl) {
      Linking.openURL(flight.bookingUrl).catch(() => {});
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.airlineRow}>
          <View style={styles.airlineIcon}>
            <Ionicons name="airplane" size={16} color="#38bdf8" />
          </View>
          <View>
            <Text style={styles.airlineName}>{flight.airline}</Text>
            <Text style={styles.flightNumber}>{flight.flightNumber}</Text>
          </View>
        </View>

        <View style={styles.cabinBadge}>
          <Text style={styles.cabinText}>{flight.cabinClass.replace('_', ' ')}</Text>
        </View>
      </View>

      <View style={styles.scheduleRow}>
        <View style={styles.timeBlock}>
          <Text style={styles.time}>{formatTime(flight.departureTime)}</Text>
          <Text style={styles.airportCode}>{flight.originAirport}</Text>
          <Text style={styles.city}>{flight.originCity}</Text>
        </View>

        <View style={styles.flightPath}>
          <Text style={styles.duration}>{flight.duration}</Text>
          <View style={styles.pathLineContainer}>
            <View style={styles.pathDot} />
            <View style={styles.pathLine} />
            <Ionicons name="airplane" size={14} color="#10b981" style={styles.pathPlane} />
            <View style={styles.pathLine} />
            <View style={styles.pathDot} />
          </View>
          <View style={[styles.stopsPill, flight.stops === 0 ? styles.nonstopPill : styles.layoverPill]}>
            <Text style={[styles.stopsText, flight.stops === 0 ? styles.nonstopText : styles.layoverText]}>
              {flight.stops === 0 ? 'Nonstop' : `${flight.stops} Stop`}
            </Text>
          </View>
        </View>

        <View style={[styles.timeBlock, styles.alignRight]}>
          <Text style={styles.time}>{formatTime(flight.arrivalTime)}</Text>
          <Text style={styles.airportCode}>{flight.destinationAirport}</Text>
          <Text style={styles.city}>{flight.destinationCity}</Text>
        </View>
      </View>

      {flight.baggage ? (
        <View style={styles.baggageRow}>
          <View style={styles.bagItem}>
            <Ionicons name="briefcase-outline" size={12} color="#a1a1aa" />
            <Text style={styles.bagText}>{flight.baggage.carryOn}</Text>
          </View>
          <View style={styles.bagItem}>
            <Ionicons name="bag-check-outline" size={12} color="#a1a1aa" />
            <Text style={styles.bagText}>{flight.baggage.checked}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.footer}>
        <View>
          <Text style={styles.priceLabel}>Price per person</Text>
          <Text style={styles.priceValue}>
            {currencySymbol}
            {convertedPrice}
          </Text>
        </View>

        <TouchableOpacity style={styles.bookButton} onPress={handleBooking} activeOpacity={0.8}>
          <Text style={styles.bookButtonText}>Select Flight</Text>
          <Ionicons name="arrow-forward" size={14} color="#09090b" />
        </TouchableOpacity>
      </View>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  airlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  airlineIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#0369a133',
    alignItems: 'center',
    justifyContent: 'center',
  },
  airlineName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fafafa',
  },
  flightNumber: {
    fontSize: 11,
    color: '#a1a1aa',
    marginTop: 1,
  },
  cabinBadge: {
    backgroundColor: '#27272a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cabinText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38bdf8',
    textTransform: 'uppercase',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  timeBlock: {
    flex: 1,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f4f4f5',
  },
  airportCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10b981',
    marginTop: 2,
  },
  city: {
    fontSize: 11,
    color: '#a1a1aa',
    marginTop: 1,
  },
  flightPath: {
    flex: 1.2,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  duration: {
    fontSize: 11,
    color: '#a1a1aa',
    marginBottom: 4,
    fontWeight: '600',
  },
  pathLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  pathDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#52525b',
  },
  pathLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#3f3f46',
  },
  pathPlane: {
    transform: [{ rotate: '90deg' }],
    marginHorizontal: 4,
  },
  stopsPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  nonstopPill: {
    backgroundColor: '#052e16',
  },
  layoverPill: {
    backgroundColor: '#451a03',
  },
  stopsText: {
    fontSize: 10,
    fontWeight: '700',
  },
  nonstopText: {
    color: '#34d399',
  },
  layoverText: {
    color: '#fbbf24',
  },
  baggageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#27272a',
    marginBottom: 12,
  },
  bagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bagText: {
    fontSize: 11,
    color: '#a1a1aa',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 10,
    color: '#a1a1aa',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#10b981',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  bookButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#09090b',
  },
});

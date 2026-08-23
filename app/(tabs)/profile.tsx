import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { getUserPreferences, saveUserPreferences } from '../../services/storageService';
import { SUPPORTED_CURRENCIES } from '../../types';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  useEffect(() => {
    getUserPreferences().then((prefs) => {
      if (prefs.currencyCode) {
        setSelectedCurrency(prefs.currencyCode);
      }
    });
  }, []);

  const handleSelectCurrency = async (code: string) => {
    setSelectedCurrency(code);
    await saveUserPreferences({ currencyCode: code, theme: 'dark' });
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (e) {
            console.error('[ProfileScreen] SignOut error:', e);
          }
        },
      },
    ]);
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Profile & Settings" subtitle="Account details & travel preferences" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.displayName)}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.displayName || 'Travel Explorer'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#10b981" />
              <Text style={styles.verifiedText}>Firebase Authenticated</Text>
            </View>
          </View>
        </View>

        {/* Currency Preferences */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cash-outline" size={18} color="#10b981" />
            <Text style={styles.sectionTitle}>Preferred Currency</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            All flight deals and daily trip costs will adapt to your currency.
          </Text>

          <View style={styles.currencyGrid}>
            {SUPPORTED_CURRENCIES.map((curr) => {
              const isSelected = selectedCurrency === curr.code;
              return (
                <TouchableOpacity
                  key={curr.code}
                  style={[styles.currencyPill, isSelected && styles.currencyPillActive]}
                  onPress={() => handleSelectCurrency(curr.code)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.currSymbol, isSelected && styles.currSymbolActive]}>
                    {curr.symbol}
                  </Text>
                  <Text style={[styles.currCode, isSelected && styles.currCodeActive]}>
                    {curr.code}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* App Info & Diagnostics */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={18} color="#38bdf8" />
            <Text style={styles.sectionTitle}>Application Info</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Framework</Text>
            <Text style={styles.infoValue}>React Native (Expo SDK)</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Navigation</Text>
            <Text style={styles.infoValue}>Expo Router (File-based)</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Authentication</Text>
            <Text style={styles.infoValue}>Firebase Auth (Email/Password)</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>AI Model</Text>
            <Text style={styles.infoValue}>Gemini Flash Engine</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Flight Provider</Text>
            <Text style={styles.infoValue}>Aviationstack API</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          <Text style={styles.signOutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 20,
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 22,
    backgroundColor: '#052e16',
    borderWidth: 1,
    borderColor: '#10b98144',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#34d399',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fafafa',
  },
  userEmail: {
    fontSize: 12,
    color: '#a1a1aa',
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#052e16',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    marginTop: 8,
  },
  verifiedText: {
    fontSize: 10,
    color: '#34d399',
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#18181b',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fafafa',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#a1a1aa',
    marginBottom: 14,
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  currencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#09090b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    gap: 6,
  },
  currencyPillActive: {
    backgroundColor: '#052e16',
    borderColor: '#10b981',
  },
  currSymbol: {
    fontSize: 13,
    fontWeight: '800',
    color: '#a1a1aa',
  },
  currSymbolActive: {
    color: '#10b981',
  },
  currCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d4d4d8',
  },
  currCodeActive: {
    color: '#fafafa',
    fontWeight: '800',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  infoLabel: {
    fontSize: 13,
    color: '#a1a1aa',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fafafa',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#450a0a33',
    borderWidth: 1,
    borderColor: '#ef444444',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    marginTop: 8,
  },
  signOutBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ef4444',
  },
});

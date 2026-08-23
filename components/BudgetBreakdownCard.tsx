import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BudgetBreakdown } from '../types';

interface BudgetBreakdownCardProps {
  budget: BudgetBreakdown;
  currencySymbol?: string;
  rateToUSD?: number;
}

export const BudgetBreakdownCard: React.FC<BudgetBreakdownCardProps> = ({
  budget,
  currencySymbol = '$',
  rateToUSD = 1,
}) => {
  const total = Math.round(budget.totalEstimatedUSD * rateToUSD);
  const accom = Math.round(budget.accommodationUSD * rateToUSD);
  const food = Math.round(budget.foodAndDiningUSD * rateToUSD);
  const acts = Math.round(budget.activitiesAndAttractionsUSD * rateToUSD);
  const trans = Math.round(budget.localTransportUSD * rateToUSD);

  const items = [
    { label: 'Accommodation', amount: accom, icon: 'bed-outline' as const, color: '#38bdf8' },
    { label: 'Food & Dining', amount: food, icon: 'restaurant-outline' as const, color: '#f59e0b' },
    { label: 'Activities & Tours', amount: acts, icon: 'ticket-outline' as const, color: '#a855f7' },
    { label: 'Local Transit', amount: trans, icon: 'car-outline' as const, color: '#10b981' },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Budget Breakdown</Text>
          <Text style={styles.subtitle}>Estimated total trip expenses</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalLabel}>Total Est.</Text>
          <Text style={styles.totalValue}>
            {currencySymbol}
            {total}
          </Text>
        </View>
      </View>

      <View style={styles.breakdownList}>
        {items.map((item, idx) => {
          const percentage = total > 0 ? Math.round((item.amount / total) * 100) : 0;
          return (
            <View key={idx} style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: `${item.color}22` }]}>
                  <Ionicons name={item.icon} size={16} color={item.color} />
                </View>
                <View>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemPercent}>{percentage}% of total</Text>
                </View>
              </View>
              <Text style={styles.itemAmount}>
                {currencySymbol}
                {item.amount}
              </Text>
            </View>
          );
        })}
      </View>

      {budget.budgetTips && budget.budgetTips.length > 0 ? (
        <View style={styles.tipsSection}>
          <View style={styles.tipsHeader}>
            <Ionicons name="sparkles" size={14} color="#10b981" />
            <Text style={styles.tipsTitle}>Smart Saving Tips</Text>
          </View>
          {budget.budgetTips.map((tip, idx) => (
            <View key={idx} style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={13} color="#10b981" style={styles.checkIcon} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f4f4f5',
  },
  subtitle: {
    fontSize: 12,
    color: '#a1a1aa',
    marginTop: 2,
  },
  totalBadge: {
    backgroundColor: '#052e16',
    borderWidth: 1,
    borderColor: '#10b98144',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 10,
    color: '#6ee7b7',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#34d399',
  },
  breakdownList: {
    gap: 12,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#09090b',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f4f4f5',
  },
  itemPercent: {
    fontSize: 11,
    color: '#a1a1aa',
    marginTop: 1,
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fafafa',
  },
  tipsSection: {
    backgroundColor: '#064e3b22',
    borderWidth: 1,
    borderColor: '#05966933',
    padding: 14,
    borderRadius: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6ee7b7',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  checkIcon: {
    marginTop: 2,
  },
  tipText: {
    fontSize: 12,
    color: '#d1fae5',
    flex: 1,
    lineHeight: 17,
  },
});

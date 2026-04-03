import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LoyaltyCard } from '@/types/database';

interface Props {
  card: LoyaltyCard;
}

export function LoyaltyCardComponent({ card }: Props) {
  const progress = card.loyalty_plans
    ? (card.current_washes / card.loyalty_plans.required_washes) * 100
    : 0;

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d2d2d']}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <Text style={styles.planName}>{card.loyalty_plans?.name}</Text>
        {card.reward_available && (
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardText}>REWARD</Text>
          </View>
        )}
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.washCount}>
          {card.current_washes} / {card.loyalty_plans?.required_washes}
        </Text>
        <Text style={styles.washLabel}>washes completed</Text>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.rewardType}>
          {card.loyalty_plans?.reward?.replace('_', ' ').toUpperCase()}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  rewardBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  progressSection: {
    marginBottom: 20,
  },
  washCount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
  },
  washLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 16,
  },
  rewardType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    textAlign: 'center',
  },
});

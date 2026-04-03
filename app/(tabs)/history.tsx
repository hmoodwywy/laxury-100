import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { washLogService } from '@/services/washLogService';
import { WashLog } from '@/types/database';
import { LinearGradient } from 'expo-linear-gradient';
import { Car, Gift, Clock } from 'lucide-react-native';

export default function HistoryScreen() {
  const { user } = useAuth();
  const [washLogs, setWashLogs] = useState<WashLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadWashLogs();

      const subscription = washLogService.subscribeToWashLogs(user.id, (logs) => {
        setWashLogs(logs);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  async function loadWashLogs() {
    if (!user) return;

    try {
      const isEmployee = user.role === 'employee' || user.role === 'admin';
      const logs = isEmployee
        ? await washLogService.getEmployeeWashLogs(user.id)
        : await washLogService.getUserWashLogs(user.id);

      setWashLogs(logs);
    } catch (error) {
      console.error('Failed to load wash logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadWashLogs();
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }

  function renderLogItem({ item }: { item: WashLog }) {
    const isRedemption = item.action === 'reward_redeemed';

    return (
      <View style={styles.logItem}>
        <View
          style={[
            styles.iconContainer,
            isRedemption ? styles.redeemIcon : styles.washIcon,
          ]}
        >
          {isRedemption ? (
            <Gift size={24} color="#FFD700" />
          ) : (
            <Car size={24} color="#4CAF50" />
          )}
        </View>

        <View style={styles.logContent}>
          <Text style={styles.logAction}>
            {isRedemption ? 'Reward Redeemed' : 'Wash Added'}
          </Text>
          {item.notes && <Text style={styles.logNotes}>{item.notes}</Text>}
          <View style={styles.timeContainer}>
            <Clock size={14} color="#666" />
            <Text style={styles.logTime}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity History</Text>
        <Text style={styles.subtitle}>
          {washLogs.length} {washLogs.length === 1 ? 'activity' : 'activities'}
        </Text>
      </View>

      {washLogs.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Clock size={64} color="#666" />
          <Text style={styles.emptyText}>No activity yet</Text>
          <Text style={styles.emptySubtext}>
            Your wash history will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={washLogs}
          renderItem={renderLogItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFD700"
            />
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  logItem: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  washIcon: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  redeemIcon: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  logContent: {
    flex: 1,
  },
  logAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  logNotes: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logTime: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});

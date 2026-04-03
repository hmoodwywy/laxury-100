import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { loyaltyService } from '@/services/loyaltyService';
import { LoyaltyCard } from '@/types/database';
import { LoyaltyCardComponent } from '@/components/LoyaltyCardComponent';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { qrService } from '@/services/qrService';
import { Car, Star, Phone, Mail, MapPin } from 'lucide-react-native';

export default function HomeScreen() {
  const { user } = useAuth();
  const [loyaltyCard, setLoyaltyCard] = useState<LoyaltyCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadLoyaltyCard();

      const subscription = loyaltyService.subscribeLoyaltyCard(
        user.id,
        (card) => {
          setLoyaltyCard(card);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  async function loadLoyaltyCard() {
    if (!user) return;

    try {
      const card = await loyaltyService.getUserLoyaltyCard(user.id);
      setLoyaltyCard(card);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load loyalty card');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadLoyaltyCard();
  }

  if (!user) return null;

  const isEmployee = user.role === 'employee' || user.role === 'admin';
  const qrData = qrService.generateUserQR(user.id);

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user.name}</Text>
          </View>
          <View
            style={[
              styles.roleBadge,
              isEmployee && styles.employeeBadge,
            ]}
          >
            <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
          </View>
        </View>

        {user.role === 'customer' && (
          <>
            <View style={styles.qrSection}>
              <Text style={styles.sectionTitle}>Your QR Code</Text>
              <Text style={styles.sectionSubtitle}>
                Show this to our staff for a wash
              </Text>
              <View style={styles.qrContainer}>
                <QRCode value={qrData} size={200} backgroundColor="white" />
              </View>
            </View>

            {loyaltyCard && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Loyalty Card</Text>
                <LoyaltyCardComponent card={loyaltyCard} />
              </View>
            )}

            {!loyaltyCard && !loading && (
              <View style={styles.emptyCard}>
                <Car size={48} color="#666" />
                <Text style={styles.emptyText}>
                  No active loyalty card
                </Text>
                <Text style={styles.emptySubtext}>
                  Get your first wash to start earning rewards
                </Text>
              </View>
            )}
          </>
        )}

        {isEmployee && (
          <View style={styles.employeeInfo}>
            <Star size={64} color="#FFD700" />
            <Text style={styles.employeeTitle}>Employee Dashboard</Text>
            <Text style={styles.employeeSubtitle}>
              Use the Scan tab to add washes and redeem rewards
            </Text>
          </View>
        )}

        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact Us</Text>

          <TouchableOpacity style={styles.contactItem}>
            <Phone size={20} color="#FFD700" />
            <Text style={styles.contactText}>0548383525</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem}>
            <Mail size={20} color="#FFD700" />
            <Text style={styles.contactText}>luxuryautowash.sa@gmail.com</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem}>
            <MapPin size={20} color="#FFD700" />
            <Text style={styles.contactText}>View Location</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 16,
    color: '#999',
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  roleBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  employeeBadge: {
    backgroundColor: '#4CAF50',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  qrSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
  },
  section: {
    marginBottom: 32,
  },
  emptyCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 48,
    alignItems: 'center',
    marginBottom: 32,
  },
  emptyText: {
    fontSize: 18,
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
  employeeInfo: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 48,
    alignItems: 'center',
    marginBottom: 32,
  },
  employeeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
  },
  employeeSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  contactSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#fff',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  LogOut,
  MapPin,
  Video,
  Camera,
  Shield,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await signOut();
            router.replace('/(auth)/login');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to sign out');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  }

  async function openLink(url: string) {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  }

  if (!user) return null;

  const isEmployee = user.role === 'employee' || user.role === 'admin';

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <User size={48} color="#FFD700" />
          </View>

          <Text style={styles.name}>{user.name}</Text>

          <View
            style={[
              styles.roleBadge,
              isEmployee && styles.employeeBadge,
            ]}
          >
            <Shield size={16} color="#000" />
            <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
          </View>

          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                user.subscription_status === 'active' && styles.activeDot,
              ]}
            />
            <Text style={styles.statusText}>
              {user.subscription_status === 'active'
                ? 'Active Subscription'
                : 'No Active Subscription'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>

          <View style={styles.detailItem}>
            <Mail size={20} color="#FFD700" />
            <Text style={styles.detailText}>{user.email}</Text>
          </View>

          <View style={styles.detailItem}>
            <Phone size={20} color="#FFD700" />
            <Text style={styles.detailText}>{user.phone}</Text>
          </View>

          <View style={styles.detailItem}>
            <CreditCard size={20} color="#FFD700" />
            <Text style={styles.detailText}>
              Member since {new Date(user.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Info</Text>

          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => openLink('tel:0548383525')}
          >
            <Phone size={20} color="#FFD700" />
            <Text style={styles.linkText}>0548383525</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => openLink('mailto:luxuryautowash.sa@gmail.com')}
          >
            <Mail size={20} color="#FFD700" />
            <Text style={styles.linkText}>luxuryautowash.sa@gmail.com</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkItem}
            onPress={() =>
              openLink('https://maps.app.goo.gl/qNCvDd9XRjU56reT8')
            }
          >
            <MapPin size={20} color="#FFD700" />
            <Text style={styles.linkText}>View on Maps</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkItem}
            onPress={() =>
              openLink('https://www.tiktok.com/@luxuryautowash.sa')
            }
          >
            <Video size={20} color="#FFD700" />
            <Text style={styles.linkText}>TikTok</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => openLink('https://snapchat.com/t/KqGqXCJn')}
          >
            <Camera size={20} color="#FFD700" />
            <Text style={styles.linkText}>Snapchat</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={loading}
        >
          <LogOut size={20} color="#fff" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  profileCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2d2d2d',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  employeeBadge: {
    backgroundColor: '#4CAF50',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
  },
  activeDot: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#999',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 16,
    color: '#fff',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#ff3b30',
    borderRadius: 12,
    padding: 18,
    marginTop: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

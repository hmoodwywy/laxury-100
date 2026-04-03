import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '@/contexts/AuthContext';
import { qrService } from '@/services/qrService';
import { loyaltyService } from '@/services/loyaltyService';
import { supabase } from '@/lib/supabase';
import { User, LoyaltyCard } from '@/types/database';
import { X, Check, Gift } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ScannerScreen() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [scannedUser, setScannedUser] = useState<User | null>(null);
  const [loyaltyCard, setLoyaltyCard] = useState<LoyaltyCard | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'employee' && user.role !== 'admin')) {
      Alert.alert('Access Denied', 'This feature is for employees only');
    }
  }, [user]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.message}>
            Camera access is required to scan QR codes
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  async function handleBarCodeScanned({ data }: { data: string }) {
    if (!scanning || processing) return;

    setScanning(false);
    setProcessing(true);

    try {
      const qrData = qrService.parseUserQR(data);

      if (!qrData) {
        Alert.alert('Invalid QR Code', 'This is not a valid customer QR code');
        setScanning(true);
        setProcessing(false);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', qrData.userId)
        .single();

      if (userError || !userData) {
        Alert.alert('Error', 'Customer not found');
        setScanning(true);
        setProcessing(false);
        return;
      }

      if (userData.subscription_status !== 'active') {
        Alert.alert(
          'Inactive Subscription',
          'This customer does not have an active subscription'
        );
        setScanning(true);
        setProcessing(false);
        return;
      }

      const card = await loyaltyService.getUserLoyaltyCard(qrData.userId);

      setScannedUser(userData);
      setLoyaltyCard(card);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to scan QR code');
      setScanning(true);
    } finally {
      setProcessing(false);
    }
  }

  async function handleAddWash() {
    if (!scannedUser || !user) return;

    setProcessing(true);
    try {
      const result = await loyaltyService.addWash(scannedUser.id, user.id);

      Alert.alert(
        'Success',
        result.message,
        [{ text: 'OK', onPress: resetScanner }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add wash');
    } finally {
      setProcessing(false);
    }
  }

  async function handleRedeemReward() {
    if (!scannedUser || !user || !loyaltyCard?.reward_available) return;

    Alert.alert(
      'Confirm Redemption',
      'Are you sure you want to redeem this reward?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: async () => {
            setProcessing(true);
            try {
              const result = await loyaltyService.redeemReward(
                scannedUser.id,
                user.id
              );

              Alert.alert(
                'Success',
                result.message,
                [{ text: 'OK', onPress: resetScanner }]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to redeem reward');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  }

  function resetScanner() {
    setScannedUser(null);
    setLoyaltyCard(null);
    setScanning(true);
  }

  return (
    <View style={styles.container}>
      {scanning && (
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea} />
            <Text style={styles.scanText}>Scan Customer QR Code</Text>
          </View>
        </CameraView>
      )}

      <Modal visible={!!scannedUser} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#1a1a1a', '#2d2d2d']}
            style={styles.modalContent}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={resetScanner}
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Customer Found</Text>

            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{scannedUser?.name}</Text>
              <Text style={styles.customerEmail}>{scannedUser?.email}</Text>
              <Text style={styles.customerPhone}>{scannedUser?.phone}</Text>
            </View>

            {loyaltyCard && (
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>
                  {loyaltyCard.loyalty_plans?.name}
                </Text>
                <Text style={styles.cardProgress}>
                  {loyaltyCard.current_washes} /{' '}
                  {loyaltyCard.loyalty_plans?.required_washes} washes
                </Text>
                {loyaltyCard.reward_available && (
                  <View style={styles.rewardBadge}>
                    <Gift size={20} color="#FFD700" />
                    <Text style={styles.rewardText}>Reward Available</Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.actions}>
              {loyaltyCard?.reward_available ? (
                <TouchableOpacity
                  style={[styles.actionButton, styles.redeemButton]}
                  onPress={handleRedeemReward}
                  disabled={processing}
                >
                  <Gift size={24} color="#000" />
                  <Text style={styles.actionButtonText}>Redeem Reward</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.actionButton, styles.addWashButton]}
                  onPress={handleAddWash}
                  disabled={processing}
                >
                  <Check size={24} color="#000" />
                  <Text style={styles.actionButtonText}>Add Wash</Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 20,
  },
  scanText: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    color: '#fff',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
  },
  customerInfo: {
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  customerName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 8,
  },
  customerEmail: {
    fontSize: 16,
    color: '#999',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 16,
    color: '#999',
  },
  cardInfo: {
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  cardProgress: {
    fontSize: 16,
    color: '#999',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 12,
  },
  addWashButton: {
    backgroundColor: '#4CAF50',
  },
  redeemButton: {
    backgroundColor: '#FFD700',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
});

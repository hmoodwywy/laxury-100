import { Tabs } from 'expo-router';
import { Hop as Home, User, QrCode, History } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();
  const isEmployee = user?.role === 'employee' || user?.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />
      {isEmployee && (
        <Tabs.Screen
          name="scanner"
          options={{
            title: 'Scan',
            tabBarIcon: ({ size, color }) => (
              <QrCode size={size} color={color} />
            ),
          }}
        />
      )}
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ size, color }) => (
            <History size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

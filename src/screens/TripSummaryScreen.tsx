import React, { useLayoutEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTripStore } from '../state/tripStore';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { fetchUnsplashImage } from '../services/apiService';
import { useTheme } from '../theme/ThemeContext';
import mixpanel from '../services/analytics';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'TripSummary'>;
type TripSummaryRouteProp = RouteProp<RootStackParamList, 'TripSummary'>;

const SharedBadge: React.FC<{ sharedBy: string; permission: string }> = ({ sharedBy, permission }) => (
  <View style={styles.sharedBadge}>
    <Ionicons name="people-outline" size={18} color="#6366F1" style={{ marginRight: 8 }} />
    <Text style={styles.sharedBadgeText}>Shared by {sharedBy} • Can {permission}</Text>
  </View>
);

const CollaboratorAvatar: React.FC<{ name: string }> = ({ name }) => (
  <View style={styles.avatar}>
    <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
  </View>
);

const TripSummaryScreen: React.FC = () => {
  const route = useRoute<TripSummaryRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { tripId, shared, sharedBy, permission } = route.params as any;
  const trip = useTripStore((state) => state.getTripById(tripId));
  const theme = useTheme();

  const [headerImage, setHeaderImage] = React.useState<string>(FALLBACK_IMAGE);
  const [imageError, setImageError] = React.useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  React.useEffect(() => {
    mixpanel.track('TripSummary Screen Viewed');
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    async function loadImage() {
      if (trip && trip.destination) {
        const url = await fetchUnsplashImage(trip.destination);
        if (isMounted) setHeaderImage(url);
      } else {
        setHeaderImage(FALLBACK_IMAGE);
      }
    }
    loadImage();
    return () => { isMounted = false; };
  }, [trip?.destination]);

  if (!trip) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <Text style={{ fontSize: 18, color: theme.muted, fontWeight: '600' }}>Trip not found</Text>
      </SafeAreaView>
    );
  }

  const formattedStartDate = format(parseISO(trip.startDate), 'MMM d');
  const formattedEndDate = format(parseISO(trip.endDate), 'yyyy');

  const quickAccessItems = [
    {
      title: 'Itinerary',
      icon: 'map-outline' as const,
      color: theme.primary,
      onPress: () => navigation.navigate('Itinerary', {
        tripId: trip.id, tripName: trip.name, destination: trip.destination, startDate: trip.startDate, endDate: trip.endDate
      }),
    },
    {
      title: 'Packing List',
      icon: 'list-outline' as const,
      color: theme.success,
      onPress: () => navigation.navigate('PackingList', { tripId: trip.id }),
    },
    {
      title: 'Journal',
      icon: 'journal-outline' as const,
      color: theme.secondary,
      onPress: () => navigation.navigate('Journal', { tripId: trip.id }),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Hero Section with Unsplash image */}
      <ImageBackground
        source={{ uri: imageError ? FALLBACK_IMAGE : headerImage }}
        style={styles.heroImage}
        imageStyle={styles.heroImageStyle}
        onError={() => setImageError(true)}
      >
        <View style={styles.heroOverlay} />
        <SafeAreaView>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{trip.name}</Text>
            <Text style={styles.heroSubtitle}>{trip.destination}</Text>
            <View style={styles.heroPillsRow}>
              <View style={styles.heroPill}>
                <Ionicons name="calendar-outline" size={16} color={theme.primary} />
                <Text style={styles.heroPillText}>{`${formattedStartDate} - ${formattedEndDate}`}</Text>
              </View>
              <View style={styles.heroPill}>
                <Ionicons name="people-outline" size={16} color={theme.primary} />
                <Text style={styles.heroPillText}>{trip.travelers} Travelers</Text>
              </View>
            </View>
            {shared && (
              <SharedBadge sharedBy={sharedBy} permission={permission} />
            )}
          </View>
        </SafeAreaView>
      </ImageBackground>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Quick Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessRow}>
            {quickAccessItems.map((item) => (
              <TouchableOpacity
                key={item.title}
                onPress={item.onPress}
                style={[styles.quickAccessCard, { shadowColor: item.color }]}
                activeOpacity={0.85}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: `${item.color}20` }]}> 
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={styles.quickAccessText}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.muted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Collaborators */}
        {trip.collaborators && trip.collaborators.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Collaborators</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
              {trip.collaborators.map((c, idx) => (
                <View key={idx} style={styles.collaboratorCard}>
                  <CollaboratorAvatar name={c.name} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.collaboratorName}>{c.name}</Text>
                    <Text style={styles.collaboratorPermission}>Can {c.permission}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  heroImage: {
    width: '100%',
    height: 270,
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroImageStyle: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroContent: {
    paddingHorizontal: 28,
    paddingBottom: 28,
    paddingTop: 18,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#E0E7FF',
    fontWeight: '500',
    marginBottom: 12,
  },
  heroPillsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 10,
  },
  heroPillText: {
    color: '#E0E7FF',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 6,
  },
  sharedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 8,
    shadowColor: '#6366F1',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sharedBadgeText: {
    color: '#6366F1',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 18,
  },
  quickAccessRow: {
    flexDirection: 'column',
    gap: 16,
  },
  quickAccessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 0,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  quickAccessIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickAccessText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  collaboratorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 16,
    shadowColor: '#6366F1',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#6366F1',
    fontSize: 17,
    fontWeight: '700',
  },
  collaboratorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  collaboratorPermission: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '500',
    marginTop: 2,
  },
});

export default TripSummaryScreen; 
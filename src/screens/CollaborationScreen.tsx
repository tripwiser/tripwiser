import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useCollaborationStore, SharedItem } from '../state/collaborationStore';
import { useTripStore } from '../state/tripStore';
import { fetchUnsplashImage } from '../services/apiService';
import { useTheme } from '../theme/ThemeContext';

const HEADER_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
const CARD_IMAGE = 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80';
const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Helper to get Unsplash image for a location
const getLocationImage = (location: string) => {
  if (!location) return CARD_IMAGE;
  // Always return the same image for a given location
  return `https://source.unsplash.com/800x600/?${encodeURIComponent(location)}`;
};

const SharedTripCard: React.FC<{ item: SharedItem }> = ({ item }) => {
  const navigation = useNavigation<NavigationProp>();
  const getTripById = useTripStore((state) => state.getTripById);
  const trip = getTripById(item.tripId);

  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    async function loadImage() {
      if (trip && trip.destination) {
        const url = await fetchUnsplashImage(trip.destination);
        if (isMounted) setImageUrl(url);
      } else {
        setImageUrl(CARD_IMAGE);
      }
    }
    loadImage();
    return () => { isMounted = false; };
  }, [trip?.destination]);

  if (!trip) {
    return (
      <View style={styles.cardError}>
        <Text style={styles.errorText}>Trip data not found. It might have been deleted.</Text>
      </View>
    );
  }

  const handlePress = () => {
    navigation.navigate('TripSummary', {
      tripId: item.tripId,
      shared: true,
      sharedBy: item.sharedBy,
      permission: item.permission,
    });
  };

  const formattedStartDate = format(parseISO(trip.startDate), 'MMM d');
  const formattedEndDate = format(parseISO(trip.endDate), 'd, yyyy');
  const sharedAt = format(parseISO(item.sharedAt), 'MMM d, yyyy');

  return (
    <Pressable onPress={handlePress} style={styles.cardPressable}>
      <ImageBackground
        source={{ uri: imageError ? CARD_IMAGE : imageUrl || CARD_IMAGE }}
        style={styles.cardImage}
        imageStyle={styles.cardImageStyle}
        onError={() => setImageError(true)}
      >
        <View style={styles.cardOverlay} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.avatarPill}>
              <Text style={styles.avatarInitial}>{item.sharedBy.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.tripName} numberOfLines={1}>{item.tripName}</Text>
              <Text style={styles.tripDates}>{`${formattedStartDate} - ${formattedEndDate}`}</Text>
            </View>
          </View>
          <View style={styles.cardFooterRow}>
            <View style={styles.sharedByRow}>
              <Ionicons name="person-circle-outline" size={18} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.sharedByText}>{item.sharedBy}</Text>
              <Text style={styles.sharedAtText}> • {sharedAt}</Text>
            </View>
            <View style={[styles.permissionBadge, { backgroundColor: item.permission === 'edit' ? '#D1FAE5' : '#E0E7FF' }]}> 
              <Text style={[styles.permissionText, { color: item.permission === 'edit' ? '#065F46' : '#3730A3' }]}>Can {item.permission}</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={28} color="#fff" style={styles.chevronIcon} />
      </ImageBackground>
    </Pressable>
  );
};

export default function CollaborationScreen() {
  const sharedItems = useCollaborationStore((state) => state.sharedItems);
  const theme = useTheme();

  return (
    <SafeAreaView style={styles.container}>
      {/* Remove Modern Hero Header */}
      {/* <ImageBackground ...> ... </ImageBackground> */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sharedItems.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>Nothing Shared Yet</Text>
            <Text style={styles.emptyStateText}>
              When a friend shares a trip with you, it will appear here.
            </Text>
          </View>
        ) : (
          sharedItems.map((item) => <SharedTripCard key={item.id} item={item} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  headerImage: {
    width: '100%',
    height: 170,
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    paddingHorizontal: 28,
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 4, textAlign: 'center' },
  headerSubtitle: { fontSize: 15, color: '#E0E7FF', fontWeight: '500', textAlign: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  cardPressable: { marginBottom: 32, borderRadius: 24, overflow: 'hidden', elevation: 3 },
  cardImage: {
    width: '100%',
    minHeight: 160,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  cardImageStyle: {
    borderRadius: 24,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderRadius: 24,
  },
  cardContent: {
    padding: 22,
    zIndex: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarInitial: {
    color: '#6366F1',
    fontSize: 20,
    fontWeight: '700',
  },
  titleContainer: { flex: 1 },
  tripName: { fontSize: 19, fontWeight: 'bold', color: 'white', marginBottom: 2 },
  tripDates: { fontSize: 14, color: '#F3F4F6', fontWeight: '500' },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  sharedByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  sharedByText: { fontSize: 14, color: '#fff', fontWeight: '600' },
  sharedAtText: { fontSize: 13, color: '#E0E7FF', fontWeight: '400' },
  permissionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  permissionText: { fontSize: 13, fontWeight: '600' },
  chevronIcon: {
    position: 'absolute',
    right: 18,
    top: 18,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 16,
    padding: 2,
  },
  cardError: {
    backgroundColor: '#FEE2E2',
    borderRadius: 18,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    padding: 20,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
}); 
import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, FlatList } from 'react-native';

interface Destination {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
}

interface TrendingDestinationsProps {
  destinations: Destination[];
  onSelect?: (destination: Destination) => void;
  onPlanTrip?: (destination: Destination) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.88, 340);
const CARD_HEIGHT = 320;

const TrendingDestinations: React.FC<TrendingDestinationsProps> = ({ destinations, onSelect, onPlanTrip }) => {
  return (
    <View style={{ marginBottom: 32 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginLeft: 20, marginBottom: 12, color: '#222' }}>Trending Destinations</Text>
      <FlatList
        data={destinations}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 20, paddingRight: 12 }}
        renderItem={({ item: dest }) => (
          <View
            style={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              backgroundColor: '#fff',
              borderRadius: 24,
              shadowColor: '#000',
              shadowOpacity: 0.10,
              shadowRadius: 12,
              elevation: 4,
              padding: 18,
              alignItems: 'center',
              justifyContent: 'flex-start',
              marginRight: 20,
            }}
          >
            <TouchableOpacity onPress={() => onSelect && onSelect(dest)} activeOpacity={0.85}>
              <Image
                source={{ uri: dest.imageUrl }}
                style={{ width: CARD_WIDTH - 36, height: 150, borderRadius: 18, marginBottom: 14, backgroundColor: '#eee' }}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#222', textAlign: 'center', marginBottom: 6 }}>{dest.name}</Text>
            {dest.description && (
              <Text style={{ fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 16, lineHeight: 18 }}>{dest.description}</Text>
            )}
            {onPlanTrip && (
              <TouchableOpacity
                style={{
                  backgroundColor: '#4F46E5',
                  borderRadius: 16,
                  paddingVertical: 10,
                  paddingHorizontal: 28,
                  alignSelf: 'center',
                  marginTop: 4,
                  shadowColor: '#4F46E5',
                  shadowOpacity: 0.12,
                  shadowRadius: 8,
                  elevation: 2,
                }}
                onPress={() => onPlanTrip(dest)}
                activeOpacity={0.9}
              >
                <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold', letterSpacing: 0.2 }}>Plan Your Trip</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
};

export default TrendingDestinations; 
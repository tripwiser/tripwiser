import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Suggestion {
  id: string;
  name: string;
  imageUrl: string;
  reason?: string;
}

interface PersonalizedSuggestionProps {
  suggestion: Suggestion;
  onLike: () => void;
  onDislike: () => void;
}

const PersonalizedSuggestion: React.FC<PersonalizedSuggestionProps> = ({ suggestion, onLike, onDislike }) => {
  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 24, padding: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Recommended For You</Text>
      <Image
        source={{ uri: suggestion.imageUrl }}
        style={{ width: '100%', height: 140, borderRadius: 12, marginBottom: 10, backgroundColor: '#eee' }}
        resizeMode="cover"
      />
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{suggestion.name}</Text>
      {suggestion.reason && <Text style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>{suggestion.reason}</Text>}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24 }}>
        <TouchableOpacity onPress={onLike} style={{ alignItems: 'center', marginRight: 24 }}>
          <Ionicons name="thumbs-up" size={24} color="#4F46E5" />
          <Text style={{ fontSize: 12, color: '#4F46E5' }}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDislike} style={{ alignItems: 'center' }}>
          <Ionicons name="thumbs-down" size={24} color="#EF4444" />
          <Text style={{ fontSize: 12, color: '#EF4444' }}>Dislike</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PersonalizedSuggestion; 
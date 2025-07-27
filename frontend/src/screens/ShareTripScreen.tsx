import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCollaborationStore } from '../state/collaborationStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = {
  goBack: () => void;
};
type RouteProp_ = RouteProp<RootStackParamList, 'ShareTrip'>;

export default function ShareTripScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp_>();
  const { tripId, tripName } = route.params;
  
  const addSharedItem = useCollaborationStore((state) => state.addSharedItem);
  
  const [email, setEmail] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSendInvite = () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    
    setIsSending(true);
    
    // Simulate sending an invite and receiving it on the other end
    // In a real app, this would be a backend call.
    setTimeout(() => {
      const sharedItem = {
        id: `shared-${tripId}-${Date.now()}`,
        tripId,
        tripName,
        itemName: 'Entire Trip',
        itemType: 'Trip' as const,
        sharedBy: 'You', // In a real app, this would be the current user's name
        permission: canEdit ? 'edit' : ('view' as const),
        sharedAt: new Date().toISOString(),
      };

      addSharedItem(sharedItem);
      
      setIsSending(false);
      Alert.alert(
        'Invitation Sent',
        `${tripName} has been shared with ${email}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#374151" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900">Share Trip</Text>
        <View style={{ width: 24 }} />
      </View>

      <View className="p-6">
        <Text className="text-xl font-semibold text-gray-800">{tripName}</Text>
        <Text className="text-sm text-gray-500 mt-1 mb-6">
          Invite a friend to view or edit this trip.
        </Text>

        {/* Email Input */}
        <View className="bg-white p-4 rounded-xl border border-gray-200">
          <Text className="text-sm font-medium text-gray-600 mb-2">Collaborator's Email</Text>
          <TextInput
            className="text-base text-gray-900"
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus
          />
        </View>

        {/* Permissions */}
        <View className="bg-white p-4 rounded-xl border border-gray-200 mt-4 flex-row justify-between items-center">
          <View>
            <Text className="text-sm font-medium text-gray-600">Allow Editing</Text>
            <Text className="text-xs text-gray-500 mt-1">
              {canEdit ? 'They can edit all trip details.' : 'They can only view the trip.'}
            </Text>
          </View>
          <Switch
            value={canEdit}
            onValueChange={setCanEdit}
            trackColor={{ false: '#E2E8F0', true: '#4F46E5' }}
            thumbColor={'#FFFFFF'}
          />
        </View>

        {/* Send Button */}
        <Pressable
          onPress={handleSendInvite}
          disabled={isSending}
          className={`mt-6 py-4 rounded-xl items-center justify-center ${isSending ? 'bg-indigo-300' : 'bg-indigo-600'}`}
        >
          <Text className="text-white font-bold text-base">
            {isSending ? 'Sending Invite...' : 'Send Invite'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
} 
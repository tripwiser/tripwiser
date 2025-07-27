import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../state/userStore';
import { useTheme } from '../theme/ThemeContext';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const userStore = useUserStore();
  const theme = useTheme();
  const [name, setName] = useState(userStore.user?.name || '');
  const [email, setEmail] = useState(userStore.user?.email || '');
  const [avatar, setAvatar] = useState(userStore.user?.avatar || null);
  const [saving, setSaving] = useState(false);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Missing Info', 'Please enter both name and email.');
      return;
    }
    setSaving(true);
    try {
      userStore.updateProfile({ name, email, avatar });
      Alert.alert('Profile Updated', 'Your profile has been updated.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ alignItems: 'center', padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text, marginBottom: 24 }}>Edit Profile</Text>
      <Pressable onPress={pickAvatar} style={{ marginBottom: 24 }}>
        <Image
          source={avatar ? { uri: avatar } : require('../../assets/logo-new.png')}
          style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: theme.card }}
        />
        <Text style={{ color: theme.primary, textAlign: 'center', marginTop: 8 }}>Change Avatar</Text>
      </Pressable>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name"
        style={{ width: '100%', backgroundColor: theme.card, color: theme.text, borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: theme.border }}
        placeholderTextColor={theme.muted}
      />
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        style={{ width: '100%', backgroundColor: theme.card, color: theme.text, borderRadius: 12, padding: 14, marginBottom: 24, fontSize: 16, borderWidth: 1, borderColor: theme.border }}
        placeholderTextColor={theme.muted}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ flex: 1, backgroundColor: theme.muted, padding: 14, borderRadius: 12, marginRight: 8, alignItems: 'center' }}
        >
          <Text style={{ color: theme.text, fontWeight: '600' }}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={handleSave}
          style={{ flex: 1, backgroundColor: theme.primary, padding: 14, borderRadius: 12, marginLeft: 8, alignItems: 'center', opacity: saving ? 0.7 : 1 }}
          disabled={saving}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>{saving ? 'Saving...' : 'Save'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
} 
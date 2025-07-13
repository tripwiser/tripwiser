import React, { useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Animated, Dimensions, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const popularCountries = [
  { id: '1', name: 'Cameroon', imageUrl: 'https://images.unsplash.com/photo-1615463738213-b9381d217b4e?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Yaoundé skyline
  { id: '2', name: 'Lithuania', imageUrl: 'https://images.unsplash.com/photo-1549891472-991e6bc75d1e?q=80&w=873&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Vilnius Old Town
  { id: '3', name: 'Fiji', imageUrl: 'https://images.unsplash.com/photo-1717361054046-eda52d552736?q=80&w=1031&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Fiji beach
  { id: '4', name: 'Laos', imageUrl: 'https://images.unsplash.com/photo-1705917950934-7efe2b6866cc?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Luang Prabang
  { id: '5', name: 'Kazakhstan', imageUrl: 'https://images.unsplash.com/photo-1684453728323-a8c2e5b615eb?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Almaty mountains
  { id: '6', name: 'Paraguay', imageUrl: 'https://images.unsplash.com/photo-1708007736300-89c16fa57b40?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Asunción cityscape
  { id: '7', name: 'Trinidad & Tobago', imageUrl: 'https://images.unsplash.com/photo-1641409803448-c47529d682e8?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Maracas Beach
  { id: '8', name: 'Vanuatu', imageUrl: 'https://images.unsplash.com/photo-1552643450-44f3e5c7d875?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Port Vila
  { id: '9', name: 'Slovakia', imageUrl: 'https://images.unsplash.com/photo-1470043201067-764120126eb4?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Bratislava Castle
  { id: '10', name: 'Armenia', imageUrl: 'https://images.unsplash.com/photo-1528663775703-dba64f806cd1?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Yerevan & Mount Ararat
  { id: '11', name: 'Bulgaria', imageUrl: 'https://images.unsplash.com/photo-1594803294810-c860e5d29e07?q=80&w=801&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Sofia Alexander Nevsky Cathedral
  { id: '12', name: 'Panama', imageUrl: 'https://images.unsplash.com/photo-1517154868524-c6b5fbd62a1c?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Panama City skyline
  { id: '13', name: 'Thailand', imageUrl: 'https://images.unsplash.com/photo-1494948949099-1311f3e907a9?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Bangkok Grand Palace
  { id: '14', name: 'Italy', imageUrl: 'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?q=80&w=867&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Rome Colosseum
  { id: '15', name: 'Japan', imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Mount Fuji
  { id: '16', name: 'Romania', imageUrl: 'https://images.unsplash.com/photo-1526112982068-f899a62e118e?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Bucharest Palace of Parliament
  { id: '17', name: 'Brazil', imageUrl: 'https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Rio de Janeiro
  { id: '18', name: 'New Zealand', imageUrl: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Queenstown
  { id: '19', name: 'South Africa', imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Cape Town Table Mountain
  { id: '20', name: 'Sweden', imageUrl: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Stockholm
  { id: '21', name: 'Ireland', imageUrl: 'https://images.unsplash.com/photo-1557843961-b589ce207737?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Dublin
  { id: '22', name: 'Tunisia', imageUrl: 'https://images.unsplash.com/photo-1607869861980-da5f9b8b4969?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Tunis Medina
  { id: '23', name: 'Jordan', imageUrl: 'https://images.unsplash.com/photo-1548786811-dd6e453ccca7?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Petra
  { id: '24', name: 'Bosnia & Herzegovina', imageUrl: 'https://images.unsplash.com/photo-1704974738004-133747005cbb?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Mostar Bridge
  { id: '25', name: 'United States', imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // New York City
  { id: '26', name: 'Mexico', imageUrl: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Chichen Itza
  { id: '27', name: 'Australia', imageUrl: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?q=80&w=1230&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Sydney Opera House
  { id: '28', name: 'Canada', imageUrl: 'https://images.unsplash.com/photo-1519832979-6fa011b87667?q=80&w=853&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Toronto
  { id: '29', name: 'United Arab Emirates', imageUrl: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Dubai
  { id: '30', name: 'India', imageUrl: 'https://images.unsplash.com/photo-1642841819300-20ed449c02a1?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }, // Taj Mahal
];

// Duplicate the popularCountries array for seamless infinite scroll
const duplicatedCountries = [...popularCountries, ...popularCountries];
const CARD_WIDTH = 320;
const CARD_SPACING = 24;
const CARD_FULL_WIDTH = CARD_WIDTH + CARD_SPACING;

const popularDestinations = [
  {
    id: '1',
    name: 'Jaipur, Rajasthan',
    country: 'India',
    flag: '🇮🇳',
    imageUrl: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '2',
    name: 'Kichijoji, Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    imageUrl: 'https://images.unsplash.com/photo-1586584477601-b4b2b0b6e241?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  { id: '3', name: 'Yaoundé', country: 'Cameroon', flag: '🇨🇲', imageUrl: 'https://images.unsplash.com/photo-1659947234279-92bc8f2cd2fe?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '4', name: 'Vilnius', country: 'Lithuania', flag: '🇱🇹', imageUrl: 'https://images.unsplash.com/photo-1549891472-991e6bc75d1e?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '5', name: 'Nadi', country: 'Fiji', flag: '🇫🇯', imageUrl: 'https://plus.unsplash.com/premium_photo-1664304458186-9a67c1330d02?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fE5hZGklMjAoRmlqaSl8ZW58MHx8MHx8fDA%3D' },
  { id: '6', name: 'Luang Prabang', country: 'Laos', flag: '🇱🇦', imageUrl: 'https://images.unsplash.com/photo-1642085107639-bc9e2f7ee835?q=80&w=1228&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '7', name: 'Almaty', country: 'Kazakhstan', flag: '🇰🇿', imageUrl: 'https://images.unsplash.com/photo-1659651117607-d2b397cf100f?q=80&w=1223&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '8', name: 'Asunción', country: 'Paraguay', flag: '🇵🇾', imageUrl: 'https://images.unsplash.com/photo-1585318822320-300abf39f65d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjJ8fGFzdW5jaSVDMyVCM258ZW58MHx8MHx8fDA%3D' },
  { id: '9', name: 'Port of Spain', country: 'Trinidad & Tobago', flag: '🇹🇹', imageUrl: 'https://images.unsplash.com/photo-1748798634007-2b05cf208b32?q=80&w=728&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '10', name: 'Port Vila', country: 'Vanuatu', flag: '🇻🇺', imageUrl: 'https://images.unsplash.com/photo-1552643450-44f3e5c7d875?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '11', name: 'Yerevan', country: 'Armenia', flag: '🇦🇲', imageUrl: 'https://images.unsplash.com/photo-1589537368054-6a9c11ba1eac?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '12', name: 'Sofia', country: 'Bulgaria', flag: '🇧🇬', imageUrl: 'https://images.unsplash.com/photo-1594803294810-c860e5d29e07?q=80&w=1101&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '13', name: 'Panama City', country: 'Panama', flag: '🇵🇦', imageUrl: 'https://images.unsplash.com/photo-1540610410855-b4c8877b761c?q=80&w=1348&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '14', name: 'Bangkok', country: 'Thailand', flag: '🇹🇭', imageUrl: 'https://images.unsplash.com/photo-1570712809958-9344e814f66f?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '15', name: 'Rome', country: 'Italy', flag: '🇮🇹', imageUrl: 'https://images.unsplash.com/photo-1720224469862-cd415df10080?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '16', name: 'Kyoto', country: 'Japan', flag: '🇯🇵', imageUrl: 'https://images.unsplash.com/photo-1702392282519-5a60e93b71f1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '17', name: 'Bucharest', country: 'Romania', flag: '🇷🇴', imageUrl: 'https://plus.unsplash.com/premium_photo-1690921288020-1556d0868ff5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '18', name: 'Rio de Janeiro', country: 'Brazil', flag: '🇧🇷', imageUrl: 'https://images.unsplash.com/photo-1655997113841-4da21c357225?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '19', name: 'Queenstown', country: 'New Zealand', flag: '🇳🇿', imageUrl: 'https://images.unsplash.com/photo-1706416857635-140589ff80e8?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '20', name: 'Cape Town', country: 'South Africa', flag: '🇿🇦', imageUrl: 'https://images.unsplash.com/photo-1636811773039-7b69f9081a98?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '21', name: 'Stockholm', country: 'Sweden', flag: '🇸🇪', imageUrl: 'https://images.unsplash.com/photo-1713981578031-add18bc3455a?q=80&w=1026&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '22', name: 'Dublin', country: 'Ireland', flag: '🇮🇪', imageUrl: 'https://images.unsplash.com/photo-1716348013874-93c2a295bf8d?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '23', name: 'Amman', country: 'Jordan', flag: '🇯🇴', imageUrl: 'https://images.unsplash.com/photo-1646671152000-25ff4ded9fe4?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '24', name: 'Sarajevo', country: 'Bosnia & Herzegovina', flag: '🇧🇦', imageUrl: 'https://images.unsplash.com/photo-1582570012409-02464571b269?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '25', name: 'New York City', country: 'United States', flag: '🇺🇸', imageUrl: 'https://images.unsplash.com/photo-1654154200405-d06edc5b0754?q=80&w=691&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '26', name: 'Cancún', country: 'Mexico', flag: '🇲🇽', imageUrl: 'https://images.unsplash.com/photo-1732827516894-29638212130e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Q2FuYyVDMyVCQW4lMjAoTWV4aWNvKXxlbnwwfHwwfHx8MA%3D%3D' },
  { id: '27', name: 'Sydney', country: 'Australia', flag: '🇦🇺', imageUrl: 'https://images.unsplash.com/photo-1689834676093-171674c41b01?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '28', name: 'Toronto', country: 'Canada', flag: '🇨🇦', imageUrl: 'https://images.unsplash.com/photo-1586754787360-e8394f256a94?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '29', name: 'Dubai', country: 'United Arab Emirates', flag: '🇦🇪', imageUrl: 'https://images.unsplash.com/photo-1723642502237-f4a4a7fcc9a5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: '30', name: 'Agra', country: 'India', flag: '🇮🇳', imageUrl: 'https://images.unsplash.com/photo-1663736290978-9e0c9a04a924?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
];

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [topDestinations, setTopDestinations] = React.useState<any[]>([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedDestination, setSelectedDestination] = React.useState<any>(null);
  const [hasError, setHasError] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      try {
        AsyncStorage.getItem('top5Destinations').then((data) => {
          console.log('Raw data from AsyncStorage:', data);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              console.log('Parsed topDestinations:', parsed);
              // Validate and clean the data
              const validatedDestinations = Array.isArray(parsed) ? parsed.map(dest => ({
                ...dest // Use the backend object as-is, including imageUrl
              })) : [];
              console.log('Validated topDestinations:', validatedDestinations);
              setTopDestinations(validatedDestinations);
            } catch (error) {
              console.log('Error parsing AsyncStorage data:', error);
              setTopDestinations([]);
            }
          } else {
            console.log('No data in AsyncStorage');
            setTopDestinations([]);
          }
        }).catch((error) => {
          console.log('Error reading from AsyncStorage:', error);
          setTopDestinations([]);
        });
      } catch (error) {
        console.log('Error in useFocusEffect:', error);
        setTopDestinations([]);
        setHasError(true);
      }
    }, [])
  );

  useEffect(() => {
    let isMounted = true;
    const totalCards = popularCountries.length;
    const totalWidth = CARD_FULL_WIDTH * totalCards;
    function animateScroll() {
      if (!isMounted) return;
      Animated.timing(scrollX, {
        toValue: totalWidth,
        duration: totalWidth * 12, // adjust speed (ms per px)
        useNativeDriver: false,
        easing: t => t, // linear
      }).start(({ finished }) => {
        if (finished && isMounted) {
          scrollX.setValue(0);
          animateScroll();
        }
      });
    }
    animateScroll();
    return () => {
      isMounted = false;
      scrollX.stopAnimation();
    };
  }, [scrollX]);

  useEffect(() => {
    const id = scrollX.addListener(({ value }) => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: value, animated: false });
      }
    });
    return () => scrollX.removeListener(id);
  }, [scrollX]);

  if (hasError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F7F7' }} edges={['top', 'left', 'right']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
            Something went wrong. Please restart the app.
          </Text>
          <TouchableOpacity 
            style={{ backgroundColor: '#4F46E5', padding: 15, borderRadius: 10 }}
            onPress={() => setHasError(false)}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F7F7' }} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        {/* Large Header */}
        <View style={{ paddingHorizontal: 18, paddingTop: 32, paddingBottom: 18 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#1f2937', marginBottom: 8 }}>Discover</Text>
        </View>

        {/* Your Dream Destinations Section */}
        {topDestinations.length > 0 && (
          <View style={{ marginBottom: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 18, marginBottom: 8 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Your Dream Destinations</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 18, paddingRight: 12, alignItems: 'center' }}
            >
              {topDestinations.slice(0, 5).map((item: any, idx: number) => (
                <TouchableOpacity
                  key={item.name + '-' + idx}
                  style={{
                    width: 220,
                    borderRadius: 26,
                    marginRight: 20,
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                    borderWidth: 0,
                    borderColor: 'transparent',
                  }}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedDestination(item);
                    setModalVisible(true);
                  }}
                >
                  {item.imageUrl && (
                    <View>
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={{ width: 220, height: 160, borderTopLeftRadius: 26, borderTopRightRadius: 26 }}
                      />
                      <View style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.35)',
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderBottomLeftRadius: 26,
                        borderBottomRightRadius: 26,
                        alignItems: 'center',
                      }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }} numberOfLines={1}>
                          {item?.name || 'Unknown Destination'}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* Modal for zoomed-in details */}
            <Modal
              visible={modalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: '85%', backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center' }}>
                  {selectedDestination?.imageUrl && (
                    <Image
                      source={{ uri: selectedDestination.imageUrl }}
                      style={{ width: '100%', height: 180, borderRadius: 18, marginBottom: 16 }}
                      resizeMode="cover"
                    />
                  )}
                  <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 8 }}>{selectedDestination?.name}</Text>
                  {selectedDestination?.description && <Text style={{ fontSize: 16, marginBottom: 8 }}>{selectedDestination.description}</Text>}
                  {selectedDestination?.bestTimeToVisit && <Text style={{ fontSize: 15, marginBottom: 4 }}>Best Time: {selectedDestination.bestTimeToVisit}</Text>}
                  {selectedDestination?.budgetRange && <Text style={{ fontSize: 15, marginBottom: 4 }}>Budget: {selectedDestination.budgetRange}</Text>}
                  <Pressable
                    style={{ marginTop: 18, backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 28 }}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          </View>
        )}
        {/* Popular Countries (Auto-scroll) */}
        <View style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 18, marginBottom: 8 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Popular Countries</Text>
          </View>
          <Animated.ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={{ paddingLeft: 18, paddingRight: 12, alignItems: 'center' }}
          >
            {duplicatedCountries.map((item: any, idx: number) => (
              <View key={item.id + '-' + idx} style={{
                width: CARD_WIDTH,
                height: 220,
                borderRadius: 28,
                marginRight: CARD_SPACING,
                overflow: 'hidden',
                backgroundColor: '#eee',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}>
                <Image source={{ uri: item.imageUrl }} style={{ width: CARD_WIDTH, height: 220, borderRadius: 28, position: 'absolute', top: 0, left: 0 }} />
                <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.25)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
                  <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold' }}>{item.name}</Text>
                </View>
              </View>
            ))}
          </Animated.ScrollView>
        </View>

        {/* Popular Destinations (Manual scroll, fixed height) */}
        <View style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 18, marginBottom: 8 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Popular Destinations</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 18, paddingRight: 12, alignItems: 'center' }}
          >
            {popularDestinations.map((item: any, idx: number) => (
              <View key={item.id + '-' + idx} style={{
                width: 180,
                borderRadius: 22,
                marginRight: 16,
                overflow: 'hidden',
                backgroundColor: '#fff',
              }}>
                <View style={{ position: 'relative' }}>
                  <Image source={{ uri: item.imageUrl }} style={{ width: 180, height: 120, borderTopLeftRadius: 22, borderTopRightRadius: 22 }} />
                  <TouchableOpacity style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 18, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="heart-outline" size={18} color="#4F46E5" />
                  </TouchableOpacity>
                  <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 10, backgroundColor: 'rgba(0,0,0,0.25)', borderBottomLeftRadius: 22, borderBottomRightRadius: 22 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#fff', textAlign: 'left' }} numberOfLines={1}>{item.name}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Let's Find Your Next Destination Section */}
        <View style={{ marginHorizontal: 18, marginTop: 24, marginBottom: 32 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Let’s Find Your Next Destination</Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#4F46E5',
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: 'center',
              shadowColor: '#4F46E5',
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 2,
              marginBottom: 12,
            }}
            onPress={() => navigation.navigate('DreamDestination')}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{topDestinations.length > 0 ? 'Change' : 'Start'}</Text>
          </TouchableOpacity>
          {/* Debug button to clear AsyncStorage */}
          <TouchableOpacity
            style={{
              backgroundColor: '#EF4444',
              borderRadius: 16,
              paddingVertical: 12,
              alignItems: 'center',
              shadowColor: '#EF4444',
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 2,
            }}
            onPress={async () => {
              await AsyncStorage.removeItem('top5Destinations');
              setTopDestinations([]);
              console.log('Cleared top5Destinations from AsyncStorage');
            }}
          >
            <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>Clear Saved Destinations</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen; 
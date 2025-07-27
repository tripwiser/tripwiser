import i18n from 'i18n-js';
import { useUserStore } from '../state/userStore';

// Example translations
const en = {
  settings: {
    title: 'Settings',
    theme: 'App Theme',
    language: 'App Language',
    notifications: 'Notifications',
    reminders: 'Packing Reminders',
    weather: 'Weather Updates',
    tips: 'Travel Tips',
    temperature: 'Temperature Unit',
    preferences: 'Preferences',
    account: 'Account',
    support: 'Support',
    signOut: 'Sign Out',
    subscription: 'Subscription',
    editProfile: 'Edit Profile',
    sharedWithYou: 'Shared With You',
    resetData: 'Reset All Data',
    help: 'Help & FAQ',
    currentTheme: 'Currently using {{theme}} theme',
    currentLanguage: 'Currently using {{language}}',
  },
  templates: {
    title: 'Templates',
    search: 'Search templates...',
    noTemplates: 'No templates found',
    create: 'Create',
    categories: {
      all: 'All',
      business: 'Business',
      leisure: 'Leisure',
      adventure: 'Adventure',
      family: 'Family',
      custom: 'Custom',
    },
  },
};

const es = {
  settings: {
    title: 'Configuración',
    theme: 'Tema de la aplicación',
    language: 'Idioma de la aplicación',
    notifications: 'Notificaciones',
    reminders: 'Recordatorios de equipaje',
    weather: 'Actualizaciones del clima',
    tips: 'Consejos de viaje',
    temperature: 'Unidad de temperatura',
    preferences: 'Preferencias',
    account: 'Cuenta',
    support: 'Soporte',
    signOut: 'Cerrar sesión',
    subscription: 'Suscripción',
    editProfile: 'Editar perfil',
    sharedWithYou: 'Compartido contigo',
    resetData: 'Restablecer todos los datos',
    help: 'Ayuda y preguntas frecuentes',
    currentTheme: 'Actualmente usando el tema {{theme}}',
    currentLanguage: 'Actualmente usando {{language}}',
  },
  templates: {
    title: 'Plantillas',
    search: 'Buscar plantillas...',
    noTemplates: 'No se encontraron plantillas',
    create: 'Crear',
    categories: {
      all: 'Todas',
      business: 'Negocios',
      leisure: 'Ocio',
      adventure: 'Aventura',
      family: 'Familia',
      custom: 'Personalizado',
    },
  },
};

const fr = {
  settings: {
    title: 'Paramètres',
    theme: 'Thème de l’application',
    language: 'Langue de l’application',
    notifications: 'Notifications',
    reminders: 'Rappels de bagages',
    weather: 'Mises à jour météo',
    tips: 'Conseils de voyage',
    temperature: 'Unité de température',
    preferences: 'Préférences',
    account: 'Compte',
    support: 'Support',
    signOut: 'Se déconnecter',
    subscription: 'Abonnement',
    editProfile: 'Modifier le profil',
    sharedWithYou: 'Partagé avec vous',
    resetData: 'Réinitialiser toutes les données',
    help: 'Aide et FAQ',
    currentTheme: 'Thème actuel : {{theme}}',
    currentLanguage: 'Langue actuelle : {{language}}',
  },
  templates: {
    title: 'Modèles',
    search: 'Rechercher des modèles...',
    noTemplates: 'Aucun modèle trouvé',
    create: 'Créer',
    categories: {
      all: 'Tous',
      business: 'Affaires',
      leisure: 'Loisir',
      adventure: 'Aventure',
      family: 'Famille',
      custom: 'Personnalisé',
    },
  },
};

(i18n as any).translations = { en, es, fr };
(i18n as any).fallbacks = true;
(i18n as any).defaultLocale = 'en';

// Hook to get translation function with current language from userStore
export function useTranslation() {
  const language = useUserStore((s) => s.language) || 'en';
  (i18n as any).locale = language;
  return (i18n as any).t.bind(i18n);
} 
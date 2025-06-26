import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

// Complete the authentication session
WebBrowser.maybeCompleteAuthSession();

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'google' | 'apple' | 'email';
}

class AuthService {
  private isDevelopment = __DEV__;

  async signInWithGoogle(): Promise<AuthUser | null> {
    try {
      if (this.isDevelopment) {
        // In development, show what would happen and simulate success
        return new Promise((resolve) => {
          Alert.alert(
            'Google Authentication',
            'In production, this would open Google OAuth.\n\nFor demo purposes, we\'ll simulate a successful sign-in.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => resolve(null)
              },
              {
                text: 'Continue Demo',
                onPress: async () => {
                  // Simulate network delay
                  await new Promise(res => setTimeout(res, 1000));
                  
                  const mockUser: AuthUser = {
                    id: 'google_' + Date.now(),
                    email: 'demo@gmail.com',
                    name: 'Google Demo User',
                    picture: 'https://via.placeholder.com/150',
                    provider: 'google'
                  };

                  await this.storeAuthUser(mockUser);
                  resolve(mockUser);
                }
              }
            ]
          );
        });
      }

      // Production Google OAuth implementation
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'vibecode',
        path: 'auth'
      });

      const authUrl = `https://accounts.google.com/oauth/authorize?${new URLSearchParams({
        client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with actual client ID
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid profile email',
        state: 'google_auth'
      }).toString()}`;

      const result = await AuthSession.startAsync({
        authUrl,
        returnUrl: redirectUri,
      });

      if (result.type === 'success') {
        // In production, you would exchange the authorization code for an access token
        // and then fetch user information. For now, we'll create a mock user.
        const mockUser: AuthUser = {
          id: 'google_' + Date.now(),
          email: 'user@gmail.com',
          name: 'Google User',
          picture: 'https://via.placeholder.com/150',
          provider: 'google'
        };

        await this.storeAuthUser(mockUser);
        return mockUser;
      }

      return null;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw new Error('Failed to sign in with Google');
    }
  }

  async signInWithApple(): Promise<AuthUser | null> {
    try {
      if (this.isDevelopment) {
        // In development, show what would happen and simulate success
        return new Promise((resolve) => {
          Alert.alert(
            'Apple Authentication',
            'In production, this would open Apple ID authentication.\n\nFor demo purposes, we\'ll simulate a successful sign-in.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => resolve(null)
              },
              {
                text: 'Continue Demo',
                onPress: async () => {
                  // Simulate network delay
                  await new Promise(res => setTimeout(res, 1000));
                  
                  const mockUser: AuthUser = {
                    id: 'apple_' + Date.now(),
                    email: 'demo@icloud.com',
                    name: 'Apple Demo User',
                    provider: 'apple'
                  };

                  await this.storeAuthUser(mockUser);
                  resolve(mockUser);
                }
              }
            ]
          );
        });
      }

      // Production Apple Sign In would require proper setup
      // This is a simplified version for demonstration
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'vibecode',
        path: 'auth'
      });

      const result = await AuthSession.startAsync({
        authUrl: `https://appleid.apple.com/auth/authorize?${new URLSearchParams({
          client_id: 'com.vibecode.tripkit', // Your bundle ID
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'name email',
          response_mode: 'form_post',
          state: 'apple_auth'
        }).toString()}`,
        returnUrl: redirectUri,
      });

      if (result.type === 'success') {
        // In production, you'd parse the response and get user info
        const mockUser: AuthUser = {
          id: 'apple_' + Date.now(),
          email: 'user@icloud.com',
          name: 'Apple User',
          provider: 'apple'
        };

        await this.storeAuthUser(mockUser);
        return mockUser;
      }

      return null;
    } catch (error) {
      console.error('Apple sign in error:', error);
      throw new Error('Failed to sign in with Apple');
    }
  }

  private async storeAuthUser(user: AuthUser): Promise<void> {
    try {
      await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to store auth user:', error);
    }
  }

  async getStoredUser(): Promise<AuthUser | null> {
    try {
      const userJson = await SecureStore.getItemAsync('auth_user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Failed to get stored user:', error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('auth_user');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  }
}

export const authService = new AuthService();
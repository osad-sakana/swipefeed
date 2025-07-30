import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text } from 'react-native';

import { AppProvider, useAppContext } from './src/context/AppContext';
import { SwipeScreen } from './src/screens/SwipeScreen';
import { FeedManagerScreen } from './src/screens/FeedManagerScreen';
import { BookmarksScreen } from './src/screens/BookmarksScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ focused, name }: { focused: boolean; name: string }): JSX.Element {
  const getIcon = (): string => {
    switch (name) {
      case 'Swipe':
        return '📖';
      case 'Feeds':
        return '📡';
      case 'Bookmarks':
        return '🔖';
      case 'Settings':
        return '⚙️';
      default:
        return '📰';
    }
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.6 }}>
        {getIcon()}
      </Text>
    </View>
  );
}

function AppNavigator(): JSX.Element {
  const { theme, state } = useAppContext();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name={route.name} />
          ),
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            paddingTop: 8,
            paddingBottom: 8,
            height: 80,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Swipe" 
          component={SwipeScreen}
          options={{
            tabBarBadge: state.unreadArticles.length > 0 ? state.unreadArticles.length : undefined,
            tabBarBadgeStyle: {
              backgroundColor: theme.colors.error,
              color: '#FFFFFF',
              fontSize: 10,
              minWidth: 16,
              height: 16,
            },
          }}
        />
        <Tab.Screen 
          name="Feeds" 
          component={FeedManagerScreen}
          options={{
            title: 'RSS Feeds',
          }}
        />
        <Tab.Screen 
          name="Bookmarks" 
          component={BookmarksScreen}
          options={{
            tabBarBadge: state.articles.filter(a => a.isBookmarked).length > 0 
              ? state.articles.filter(a => a.isBookmarked).length 
              : undefined,
            tabBarBadgeStyle: {
              backgroundColor: theme.colors.warning,
              color: '#FFFFFF',
              fontSize: 10,
              minWidth: 16,
              height: 16,
            },
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App(): JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </GestureHandlerRootView>
  );
}

function AppContent(): JSX.Element {
  const { theme } = useAppContext();

  return (
    <>
      <StatusBar style={theme.name === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Feed } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { formatDate } from '@/utils/dateUtils';

interface FeedItemProps {
  feed: Feed;
  onToggleActive: (feed: Feed) => void;
  onDelete: (feed: Feed) => void;
  onUpdate: (feed: Feed) => void;
}

export function FeedItem({ feed, onToggleActive, onDelete, onUpdate }: FeedItemProps): JSX.Element {
  const { theme } = useAppContext();

  const handleDelete = (): void => {
    Alert.alert(
      'Delete Feed',
      `Are you sure you want to delete "${feed.title}"? This will also delete all articles from this feed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDelete(feed)
        },
      ]
    );
  };

  const handleToggleActive = (): void => {
    onToggleActive(feed);
  };

  const handleUpdate = (): void => {
    onUpdate(feed);
  };

  const styles = createStyles(theme, feed.isActive);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.mainContent}
        onPress={handleToggleActive}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {feed.title}
          </Text>
          <View style={[styles.statusIndicator, { backgroundColor: feed.isActive ? theme.colors.success : theme.colors.border }]} />
        </View>
        
        <Text style={styles.url} numberOfLines={1}>
          {feed.url}
        </Text>
        
        {feed.description && (
          <Text style={styles.description} numberOfLines={2}>
            {feed.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.lastUpdated}>
            Updated: {formatDate(feed.lastUpdated)}
          </Text>
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>
              {feed.unreadCount} unread
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.updateButton]}
          onPress={handleUpdate}
          activeOpacity={0.7}
        >
          <Text style={styles.updateButtonText}>Update</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(theme: any, isActive: boolean) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
      overflow: 'hidden',
      opacity: isActive ? 1 : 0.6,
    },
    mainContent: {
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
      marginRight: 12,
    },
    statusIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: 6,
    },
    url: {
      fontSize: 14,
      color: theme.colors.primary,
      marginBottom: 8,
    },
    description: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    lastUpdated: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    unreadBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    unreadCount: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    actions: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
    },
    updateButton: {
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
    },
    deleteButton: {},
    updateButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    deleteButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.error,
    },
  });
}
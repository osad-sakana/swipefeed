import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Linking } from 'react-native';
import { Article, Feed } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { formatDate } from '@/utils/dateUtils';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ArticleCardProps {
  article: Article;
  feed?: Feed | undefined;
  onPress?: () => void;
}

export function ArticleCard({ article, feed }: ArticleCardProps): JSX.Element {
  const { theme, settings } = useAppContext();

  const handleLinkPress = async (): Promise<void> => {
    try {
      await Linking.openURL(article.link);
    } catch (error) {
      console.error('Failed to open link:', error);
    }
  };

  const getFontSize = (): number => {
    switch (settings.fontSize) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      default: // medium
        return 16;
    }
  };

  const getTitleFontSize = (): number => {
    switch (settings.fontSize) {
      case 'small':
        return 20;
      case 'large':
        return 28;
      default: // medium
        return 24;
    }
  };

  const styles = createStyles(theme, getFontSize(), getTitleFontSize());

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.feedTitle} numberOfLines={1}>
            {feed?.title || 'Unknown Feed'}
          </Text>
          <Text style={styles.dateText}>
            {formatDate(article.pubDate)}
          </Text>
        </View>

        {/* Image */}
        {settings.showImages && article.imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: article.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Title */}
        <Text style={styles.title}>
          {article.title}
        </Text>

        {/* Description/Content */}
        <Text style={styles.description}>
          {article.description}
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.readMoreButton}
            onPress={handleLinkPress}
            activeOpacity={0.7}
          >
            <Text style={styles.readMoreText}>
              Read Full Article
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom padding for gesture area */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Swipe hint indicators */}
      <View style={styles.swipeHints}>
        <View style={[styles.swipeHint, styles.leftHint, { backgroundColor: theme.colors.warning }]}>
          <Text style={styles.hintText}>📖</Text>
          <Text style={styles.hintLabel}>Bookmark</Text>
        </View>
        <View style={[styles.swipeHint, styles.rightHint, { backgroundColor: theme.colors.success }]}>
          <Text style={styles.hintText}>✓</Text>
          <Text style={styles.hintLabel}>Read</Text>
        </View>
      </View>
    </View>
  );
}

function createStyles(theme: any, fontSize: number, titleFontSize: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 20,
      paddingTop: 20,
      minHeight: SCREEN_HEIGHT - 100, // Leave space for navigation
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    feedTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
      flex: 1,
      marginRight: 12,
    },
    dateText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    imageContainer: {
      marginBottom: 16,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
    },
    image: {
      width: '100%',
      height: 200,
    },
    title: {
      fontSize: titleFontSize,
      fontWeight: 'bold',
      color: theme.colors.text,
      lineHeight: titleFontSize * 1.3,
      marginBottom: 16,
    },
    description: {
      fontSize: fontSize,
      color: theme.colors.text,
      lineHeight: fontSize * 1.6,
      marginBottom: 24,
    },
    footer: {
      marginTop: 'auto',
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    readMoreButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    readMoreText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    bottomPadding: {
      height: 60,
    },
    swipeHints: {
      position: 'absolute',
      top: '45%',
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 30,
      pointerEvents: 'none',
      opacity: 0.7,
    },
    swipeHint: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      alignItems: 'center',
      minWidth: 80,
    },
    leftHint: {
      transform: [{ translateX: -100 }], // Start off screen
    },
    rightHint: {
      transform: [{ translateX: 100 }], // Start off screen
    },
    hintText: {
      fontSize: 20,
      marginBottom: 4,
    },
    hintLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });
}
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { SwipeGesture } from '@/components/SwipeGesture';
import { ArticleCard } from '@/components/ArticleCard';
import { EmptyState } from '@/components/EmptyState';
import { useAppContext } from '@/context/AppContext';
import { SwipeAction, Feed } from '@/types';

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme?.colors?.background || '#ffffff'};
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007AFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export function SwipeScreen(): JSX.Element {
  const { 
    state, 
    theme, 
    markAsRead, 
    addBookmark, 
    nextArticle,
    refreshFeeds 
  } = useAppContext();
  
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentArticle = state.unreadArticles[state.currentArticleIndex];
  const currentFeed = feeds.find(feed => feed.id === currentArticle?.feedId);

  useEffect(() => {
    loadFeeds();
  }, [state.feeds]);

  const loadFeeds = (): void => {
    setFeeds(state.feeds);
  };

  const handleSwipeAction = async (action: SwipeAction): Promise<void> => {
    if (!currentArticle) return;

    try {
      switch (action.type) {
        case 'read':
          await markAsRead(currentArticle.id);
          break;
        case 'bookmark':
          await addBookmark(currentArticle.id);
          break;
      }
      
      // Move to next article
      nextArticle();
      
    } catch (error) {
      alert('Failed to perform action. Please try again.');
    }
  };

  const handleRefresh = async (): Promise<void> => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refreshFeeds();
    } catch (error) {
      alert('Unable to refresh feeds. Please check your internet connection.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddFeed = (): void => {
    window.location.href = '/feeds';
  };

  const renderContent = (): JSX.Element => {
    if (state.isLoading) {
      return (
        <Content>
          <LoadingSpinner />
        </Content>
      );
    }

    if (state.error) {
      return (
        <EmptyState
          title="Something went wrong"
          message={state.error}
          buttonText="Try Again"
          onButtonPress={handleRefresh}
          icon="⚠️"
        />
      );
    }

    if (state.feeds.length === 0) {
      return (
        <EmptyState
          title="No RSS Feeds"
          message="Add your first RSS feed to start reading articles. Swipe right to mark as read, swipe left to bookmark."
          buttonText="Add Feed"
          onButtonPress={handleAddFeed}
          icon="📡"
        />
      );
    }

    if (state.unreadArticles.length === 0) {
      return (
        <EmptyState
          title="All Caught Up!"
          message="You've read all available articles. Pull down to refresh or add more feeds to discover new content."
          buttonText="Refresh"
          onButtonPress={handleRefresh}
          icon="🎉"
        />
      );
    }

    if (!currentArticle) {
      return (
        <EmptyState
          title="No Articles"
          message="No articles available to display."
          buttonText="Refresh"
          onButtonPress={handleRefresh}
          icon="📰"
        />
      );
    }

    return (
      <SwipeGesture
        onSwipeAction={handleSwipeAction}
        disabled={isRefreshing}
      >
        <ArticleCard
          article={currentArticle}
          feed={currentFeed}
        />
      </SwipeGesture>
    );
  };

  return (
    <Container theme={theme}>
      {renderContent()}
      
      {/* Progress indicator */}
      {state.unreadArticles.length > 0 && (
        <ProgressContainer theme={theme}>
          <ProgressBar theme={theme}>
            <ProgressFill 
              theme={theme}
              progress={((state.currentArticleIndex + 1) / state.unreadArticles.length) * 100}
            />
          </ProgressBar>
          <ProgressText>
            <ProgressLabel theme={theme}>
              {state.currentArticleIndex + 1} of {state.unreadArticles.length}
            </ProgressLabel>
          </ProgressText>
        </ProgressContainer>
      )}
    </Container>
  );
}

const ProgressContainer = styled.div`
  padding: 12px 20px;
  background: ${props => props.theme?.colors?.surface || '#f8f9fa'};
  border-top: 1px solid rgba(0,0,0,0.1);
`;

const ProgressBar = styled.div`
  height: 4px;
  border-radius: 2px;
  background: ${props => props.theme?.colors?.border || '#e9ecef'};
  margin-bottom: 8px;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  border-radius: 2px;
  background: ${props => props.theme?.colors?.primary || '#007AFF'};
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProgressLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.theme?.colors?.textSecondary || '#6c757d'};
`;
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

  useEffect(() => {
    console.log('SwipeScreen state updated:', {
      feeds: state.feeds.length,
      articles: state.articles.length,
      unreadArticles: state.unreadArticles.length,
      currentIndex: state.currentArticleIndex,
      isLoading: state.isLoading,
      error: state.error
    });
  }, [state]);

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
      alert('操作に失敗しました。もう一度お試しください。');
    }
  };

  const handleRefresh = async (): Promise<void> => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      console.log('Refreshing feeds...', { feedCount: state.feeds.length, articleCount: state.articles.length });
      await refreshFeeds();
      console.log('Refresh completed');
    } catch (error) {
      console.error('Refresh failed:', error);
      alert('フィードの更新に失敗しました。インターネット接続を確認してください。');
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
          title="エラーが発生しました"
          message={state.error}
          buttonText="再試行"
          onButtonPress={handleRefresh}
          icon="⚠️"
        />
      );
    }

    if (state.feeds.length === 0) {
      return (
        <EmptyState
          title="RSSフィードがありません"
          message="最初のRSSフィードを追加して記事の読み始めましょう。左にスワイプで既読、右にスワイプでブックマークできます。"
          buttonText="フィードを追加"
          onButtonPress={handleAddFeed}
          icon="📡"
        />
      );
    }

    if (state.unreadArticles.length === 0) {
      return (
        <EmptyState
          title="すべて読み終わりました！"
          message="すべての記事を読み終わりました。更新するか、新しいフィードを追加してください。"
          buttonText="更新"
          onButtonPress={handleRefresh}
          icon="🎉"
        />
      );
    }

    if (!currentArticle) {
      return (
        <EmptyState
          title="記事がありません"
          message="フィードから記事を取得できませんでした。フィードを更新してみてください。"
          buttonText="フィードを更新"
          onButtonPress={handleRefresh}
          icon="📰"
        />
      );
    }

    return (
      <ArticleCard
        article={currentArticle}
        feed={currentFeed}
        onMarkAsRead={() => handleSwipeAction({ type: 'read', direction: 'left', threshold: 0 })}
        onBookmark={() => handleSwipeAction({ type: 'bookmark', direction: 'right', threshold: 0 })}
      />
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
              {state.currentArticleIndex + 1} / {state.unreadArticles.length}
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
import React from 'react';
import styled from 'styled-components';
import { Article, Feed } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { formatDate } from '@/utils/dateUtils';

interface ArticleCardProps {
  article: Article;
  feed?: Feed | undefined;
  onPress?: () => void;
}

export function ArticleCard({ article, feed }: ArticleCardProps): JSX.Element {
  const { theme, settings } = useAppContext();

  const handleLinkPress = (): void => {
    window.open(article.link, '_blank');
  };

  const getFontSize = (): string => {
    switch (settings.fontSize) {
      case 'small':
        return '14px';
      case 'large':
        return '18px';
      default: // medium
        return '16px';
    }
  };

  const getTitleFontSize = (): string => {
    switch (settings.fontSize) {
      case 'small':
        return '20px';
      case 'large':
        return '28px';
      default: // medium
        return '24px';
    }
  };

  return (
    <Container theme={theme}>
      <ScrollableContent>
        {/* Header */}
        <Header theme={theme}>
          <FeedTitle theme={theme}>
            {feed?.title || 'Unknown Feed'}
          </FeedTitle>
          <DateText theme={theme}>
            {formatDate(article.pubDate)}
          </DateText>
        </Header>

        {/* Image */}
        {settings.showImages && article.imageUrl && (
          <ImageContainer theme={theme}>
            <ArticleImage
              src={article.imageUrl}
              alt={article.title}
            />
          </ImageContainer>
        )}

        {/* Title */}
        <Title theme={theme} fontSize={getTitleFontSize()}>
          {article.title}
        </Title>

        {/* Description/Content */}
        <Description theme={theme} fontSize={getFontSize()}>
          {article.description}
        </Description>

        {/* Footer */}
        <Footer theme={theme}>
          <ReadMoreButton 
            theme={theme}
            onClick={handleLinkPress}
          >
            Read Full Article
          </ReadMoreButton>
        </Footer>

        <BottomPadding />
      </ScrollableContent>

      {/* Swipe hint indicators */}
      <SwipeHints>
        <SwipeHint direction="left" theme={theme}>
          <HintText>📖</HintText>
          <HintLabel>Bookmark</HintLabel>
        </SwipeHint>
        <SwipeHint direction="right" theme={theme}>
          <HintText>✓</HintText>
          <HintLabel>Read</HintLabel>
        </SwipeHint>
      </SwipeHints>
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  background-color: ${props => props.theme?.colors?.background || '#ffffff'};
  position: relative;
`;

const ScrollableContent = styled.div`
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  min-height: calc(100vh - 100px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${props => props.theme?.colors?.border || '#e9ecef'};
`;

const FeedTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme?.colors?.primary || '#007AFF'};
  margin: 0;
  margin-right: 12px;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DateText = styled.span`
  font-size: 12px;
  color: ${props => props.theme?.colors?.textSecondary || '#6c757d'};
`;

const ImageContainer = styled.div`
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
  background-color: ${props => props.theme?.colors?.surface || '#f8f9fa'};
`;

const ArticleImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const Title = styled.h1<{ fontSize: string }>`
  font-size: ${props => props.fontSize};
  font-weight: bold;
  color: ${props => props.theme?.colors?.text || '#000000'};
  line-height: 1.3;
  margin: 0 0 16px 0;
`;

const Description = styled.p<{ fontSize: string }>`
  font-size: ${props => props.fontSize};
  color: ${props => props.theme?.colors?.text || '#000000'};
  line-height: 1.6;
  margin: 0 0 24px 0;
`;

const Footer = styled.div`
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid ${props => props.theme?.colors?.border || '#e9ecef'};
`;

const ReadMoreButton = styled.button`
  background-color: ${props => props.theme?.colors?.primary || '#007AFF'};
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 600;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const BottomPadding = styled.div`
  height: 60px;
`;

const SwipeHints = styled.div`
  position: absolute;
  top: 45%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 30px;
  pointer-events: none;
  opacity: 0.7;
`;

const SwipeHint = styled.div<{ direction: 'left' | 'right' }>`
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
  background-color: ${props => 
    props.direction === 'left' 
      ? props.theme?.colors?.warning || '#FFC107'
      : props.theme?.colors?.success || '#28A745'
  };
  transform: translateX(${props => props.direction === 'left' ? '-100px' : '100px'});
`;

const HintText = styled.span`
  font-size: 20px;
  margin-bottom: 4px;
`;

const HintLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #FFFFFF;
`;
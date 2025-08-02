import React from 'react';
import { Box, Card, CardContent, Typography, Button, Avatar, Chip } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faCheck } from '@fortawesome/free-solid-svg-icons';
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

  const getFontSize = () => {
    switch (settings.fontSize) {
      case 'small':
        return 'body2';
      case 'large':
        return 'body1';
      default:
        return 'body1';
    }
  };

  const getTitleVariant = () => {
    switch (settings.fontSize) {
      case 'small':
        return 'h5';
      case 'large':
        return 'h4';
      default:
        return 'h5';
    }
  };

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <Box
        sx={{
          height: '100%',
          overflowY: 'auto',
          padding: 2,
          minHeight: 'calc(100vh - 100px)',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 2,
            paddingBottom: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Chip
            label={feed?.title || '不明なフィード'}
            variant="outlined"
            color="primary"
            size="small"
          />
          <Typography variant="caption" color="text.secondary">
            {formatDate(article.pubDate)}
          </Typography>
        </Box>

        {/* Image */}
        {settings.showImages && article.imageUrl && (
          <Box
            sx={{
              marginBottom: 2,
              borderRadius: 1.5,
              overflow: 'hidden',
              backgroundColor: 'background.paper',
            }}
          >
            <Box
              component="img"
              src={article.imageUrl}
              alt={article.title}
              sx={{
                width: '100%',
                height: 200,
                objectFit: 'cover',
              }}
            />
          </Box>
        )}

        {/* Title */}
        <Typography
          variant={getTitleVariant()}
          component="h1"
          sx={{
            fontWeight: 'bold',
            lineHeight: 1.3,
            marginBottom: 2,
          }}
        >
          {article.title}
        </Typography>

        {/* Description/Content */}
        <Typography
          variant={getFontSize()}
          sx={{
            lineHeight: 1.6,
            marginBottom: 3,
          }}
        >
          {article.description}
        </Typography>

        {/* Footer */}
        <Box
          sx={{
            marginTop: 'auto',
            paddingTop: 2.5,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Button
            variant="contained"
            onClick={handleLinkPress}
            fullWidth
            sx={{
              fontSize: 16,
              fontWeight: 600,
              padding: '12px 24px',
              borderRadius: 1,
            }}
          >
            記事を読む
          </Button>
        </Box>

        <Box sx={{ height: '60px' }} />
      </Box>

      {/* Swipe hint indicators */}
      <Box
        sx={{
          position: 'absolute',
          top: '45%',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 30px',
          pointerEvents: 'none',
          opacity: 0.7,
        }}
      >
        <Card
          sx={{
            padding: '8px 16px',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: '80px',
            backgroundColor: 'warning.main',
            transform: 'translateX(-100px)',
          }}
        >
          <FontAwesomeIcon icon={faBookmark} size="lg" style={{ marginBottom: '4px', color: '#fff' }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#fff' }}>
            ブックマーク
          </Typography>
        </Card>
        <Card
          sx={{
            padding: '8px 16px',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: '80px',
            backgroundColor: 'success.main',
            transform: 'translateX(100px)',
          }}
        >
          <FontAwesomeIcon icon={faCheck} size="lg" style={{ marginBottom: '4px', color: '#fff' }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#fff' }}>
            既読
          </Typography>
        </Card>
      </Box>
    </Box>
  );
}


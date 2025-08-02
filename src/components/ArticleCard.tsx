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
  onMarkAsRead?: () => void;
  onBookmark?: () => void;
}

export function ArticleCard({ article, feed, onMarkAsRead, onBookmark }: ArticleCardProps): JSX.Element {
  const { theme, settings } = useAppContext();

  const handleLinkPress = (): void => {
    window.open(article.link, '_blank');
  };

  const sanitizeHTML = (html: string): string => {
    // Basic HTML sanitization
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove potentially dangerous elements
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form'];
    dangerousTags.forEach(tag => {
      const elements = tempDiv.querySelectorAll(tag);
      elements.forEach(el => el.remove());
    });
    
    // Clean up attributes
    const elements = tempDiv.querySelectorAll('*');
    elements.forEach(el => {
      const attrs = el.attributes;
      for (let i = attrs.length - 1; i >= 0; i--) {
        const attrName = attrs[i].name.toLowerCase();
        if (attrName.startsWith('on') || attrName === 'javascript:') {
          el.removeAttribute(attrName);
        }
      }
    });
    
    return tempDiv.innerHTML;
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
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
          },
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

        {/* Featured Image - only show if not already in content */}
        {settings.showImages && article.imageUrl && 
         !(article.content && article.content.includes(article.imageUrl)) && (
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

        {/* Content/Description */}
        <Box
          sx={{
            lineHeight: 1.6,
            marginBottom: 3,
            '& p': { marginBottom: 1 },
            '& img': { maxWidth: '100%', height: 'auto' },
            '& a': { color: 'primary.main' },
          }}
        >
          {article.content && article.content.trim() ? (
            <Box
              component="div"
              sx={{
                fontSize: getFontSize() === 'body2' ? '0.875rem' : '1rem',
                '& p': { marginBottom: 1.5 },
                '& h1, & h2, & h3, & h4, & h5, & h6': { 
                  marginTop: 2, 
                  marginBottom: 1.5,
                  fontWeight: 'bold'
                },
                '& ul, & ol': { paddingLeft: 2, marginBottom: 1.5 },
                '& li': { marginBottom: 0.5 },
                '& blockquote': { 
                  paddingLeft: 2, 
                  borderLeft: '4px solid',
                  borderColor: 'divider',
                  marginY: 1.5,
                  fontStyle: 'italic'
                },
                '& pre': { 
                  backgroundColor: 'grey.100', 
                  padding: 1, 
                  borderRadius: 1,
                  overflow: 'auto'
                },
                '& code': { 
                  backgroundColor: 'grey.100', 
                  padding: '2px 4px',
                  borderRadius: 0.5,
                  fontSize: '0.875em'
                }
              }}
              dangerouslySetInnerHTML={{ 
                __html: sanitizeHTML(article.content)
              }} 
            />
          ) : article.description ? (
            <Box
              component="div"
              sx={{
                fontSize: getFontSize() === 'body2' ? '0.875rem' : '1rem',
                '& p': { marginBottom: 1.5 },
                '& h1, & h2, & h3, & h4, & h5, & h6': { 
                  marginTop: 2, 
                  marginBottom: 1.5,
                  fontWeight: 'bold'
                },
                '& ul, & ol': { paddingLeft: 2, marginBottom: 1.5 },
                '& li': { marginBottom: 0.5 },
                '& blockquote': { 
                  paddingLeft: 2, 
                  borderLeft: '4px solid',
                  borderColor: 'divider',
                  marginY: 1.5,
                  fontStyle: 'italic'
                },
                '& pre': { 
                  backgroundColor: 'grey.100', 
                  padding: 1, 
                  borderRadius: 1,
                  overflow: 'auto'
                },
                '& code': { 
                  backgroundColor: 'grey.100', 
                  padding: '2px 4px',
                  borderRadius: 0.5,
                  fontSize: '0.875em'
                }
              }}
              dangerouslySetInnerHTML={{ 
                __html: sanitizeHTML(article.description)
              }} 
            />
          ) : (
            <Typography variant={getFontSize()} color="text.secondary">
              コンテンツが利用できません
            </Typography>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            marginTop: 'auto',
            paddingTop: 2.5,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
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

          {/* Action buttons */}
          {(onMarkAsRead || onBookmark) && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1.5,
              }}
            >
              {onBookmark && (
                <Button
                  variant="outlined"
                  startIcon={<FontAwesomeIcon icon={faBookmark} />}
                  onClick={onBookmark}
                  sx={{
                    borderColor: 'warning.main',
                    color: 'warning.main',
                    '&:hover': {
                      borderColor: 'warning.dark',
                      backgroundColor: 'warning.light',
                    },
                  }}
                >
                  ブックマーク
                </Button>
              )}
              {onMarkAsRead && (
                <Button
                  variant="outlined"
                  startIcon={<FontAwesomeIcon icon={faCheck} />}
                  onClick={onMarkAsRead}
                  sx={{
                    borderColor: 'success.main',
                    color: 'success.main',
                    '&:hover': {
                      borderColor: 'success.dark',
                      backgroundColor: 'success.light',
                    },
                  }}
                >
                  既読
                </Button>
              )}
            </Box>
          )}
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
            backgroundColor: 'success.main',
            transform: 'translateX(-100px)',
          }}
        >
          <FontAwesomeIcon icon={faCheck} size="lg" style={{ marginBottom: '4px', color: '#fff' }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#fff' }}>
            既読
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
            backgroundColor: 'warning.main',
            transform: 'translateX(100px)',
          }}
        >
          <FontAwesomeIcon icon={faBookmark} size="lg" style={{ marginBottom: '4px', color: '#fff' }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#fff' }}>
            ブックマーク
          </Typography>
        </Card>
      </Box>
    </Box>
  );
}


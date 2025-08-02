import React from 'react';
import { Container, Typography, Paper } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '@/context/AppContext';

export function BookmarksScreen(): JSX.Element {
  const { theme } = useAppContext();

  return (
    <Container sx={{ padding: 3, height: '100vh' }}>
      <Typography variant="h4" component="h1" sx={{ marginBottom: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <FontAwesomeIcon icon={faBookmark} />
        ブックマーク
      </Typography>
      <Paper sx={{ padding: 2 }}>
        <Typography variant="body1">
          ブックマークした記事の一覧画面です。実装予定の機能です。
        </Typography>
      </Paper>
    </Container>
  );
}
import React from 'react';
import { Container, Typography, Paper } from '@mui/material';
import { useAppContext } from '@/context/AppContext';

export function FeedManagerScreen(): JSX.Element {
  const { theme } = useAppContext();

  return (
    <Container sx={{ padding: 3, height: '100vh' }}>
      <Typography variant="h4" component="h1" sx={{ marginBottom: 3 }}>
        フィード管理
      </Typography>
      <Paper sx={{ padding: 2 }}>
        <Typography variant="body1">
          RSS フィードの管理画面です。実装予定の機能です。
        </Typography>
      </Paper>
    </Container>
  );
}
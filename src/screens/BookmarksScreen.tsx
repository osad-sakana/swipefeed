import React from 'react';
import styled from 'styled-components';
import { useAppContext } from '@/context/AppContext';

const Container = styled.div`
  padding: 20px;
  height: 100vh;
  background: ${props => props.theme?.colors?.background || '#ffffff'};
  color: ${props => props.theme?.colors?.text || '#000000'};
`;

const Title = styled.h1`
  margin: 0 0 20px 0;
  color: ${props => props.theme?.colors?.text || '#000000'};
`;

export function BookmarksScreen(): JSX.Element {
  const { theme } = useAppContext();

  return (
    <Container theme={theme}>
      <Title theme={theme}>ブックマーク</Title>
      <p>ブックマークした記事の一覧画面です。実装予定の機能です。</p>
    </Container>
  );
}
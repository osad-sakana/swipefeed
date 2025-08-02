import React from 'react';
import styled from 'styled-components';
import { useAppContext } from '@/context/AppContext';

interface EmptyStateProps {
  title: string;
  message: string;
  buttonText?: string;
  onButtonPress?: () => void;
  icon?: string;
}

export function EmptyState({ 
  title, 
  message, 
  buttonText, 
  onButtonPress, 
  icon = '📰' 
}: EmptyStateProps): JSX.Element {
  const { theme } = useAppContext();

  return (
    <Container theme={theme}>
      <Icon>{icon}</Icon>
      <Title theme={theme}>{title}</Title>
      <Message theme={theme}>{message}</Message>
      
      {buttonText && onButtonPress && (
        <Button 
          theme={theme}
          onClick={onButtonPress}
        >
          {buttonText}
        </Button>
      )}
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 40px;
  background-color: ${props => props.theme?.colors?.background || '#ffffff'};
`;

const Icon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.theme?.colors?.text || '#000000'};
  margin: 0 0 12px 0;
  text-align: center;
`;

const Message = styled.p`
  font-size: 16px;
  color: ${props => props.theme?.colors?.textSecondary || '#6c757d'};
  text-align: center;
  line-height: 1.4;
  margin: 0 0 32px 0;
`;

const Button = styled.button`
  background-color: ${props => props.theme?.colors?.primary || '#007AFF'};
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 600;
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;
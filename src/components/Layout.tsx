import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Main = styled.main`
  flex: 1;
  overflow: hidden;
`;

const Navigation = styled.nav`
  display: flex;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
`;

const NavItem = styled(NavLink)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  text-decoration: none;
  color: #666;
  font-size: 12px;
  transition: color 0.2s;

  &.active {
    color: #007AFF;
  }

  &:hover {
    color: #007AFF;
  }
`;

const NavIcon = styled.div`
  font-size: 24px;
  margin-bottom: 4px;
`;

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Container>
      <Main>{children}</Main>
      <Navigation>
        <NavItem to="/swipe">
          <NavIcon>📱</NavIcon>
          スワイプ
        </NavItem>
        <NavItem to="/feeds">
          <NavIcon>🔗</NavIcon>
          フィード
        </NavItem>
        <NavItem to="/bookmarks">
          <NavIcon>📖</NavIcon>
          ブックマーク
        </NavItem>
        <NavItem to="/settings">
          <NavIcon>⚙️</NavIcon>
          設定
        </NavItem>
      </Navigation>
    </Container>
  );
};


import React from 'react';
import { NavLink } from 'react-router-dom';
import { Box, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSwatchbook, faRss, faBookmark, faCog } from '@fortawesome/free-solid-svg-icons';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [value, setValue] = React.useState(0);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}
    >
      <Box component="main" sx={{ flex: 1, overflow: 'hidden' }}>
        {children}
      </Box>
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <BottomNavigationAction
          component={NavLink}
          to="/swipe"
          label="スワイプ"
          icon={<FontAwesomeIcon icon={faSwatchbook} />}
        />
        <BottomNavigationAction
          component={NavLink}
          to="/feeds"
          label="フィード"
          icon={<FontAwesomeIcon icon={faRss} />}
        />
        <BottomNavigationAction
          component={NavLink}
          to="/bookmarks"
          label="ブックマーク"
          icon={<FontAwesomeIcon icon={faBookmark} />}
        />
        <BottomNavigationAction
          component={NavLink}
          to="/settings"
          label="設定"
          icon={<FontAwesomeIcon icon={faCog} />}
        />
      </BottomNavigation>
    </Box>
  );
};


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { SwipeScreen } from './screens/SwipeScreen';
import { FeedManagerScreen } from './screens/FeedManagerScreen';
import { BookmarksScreen } from './screens/BookmarksScreen';
import { SettingsScreen } from './screens/SettingsScreen';

function App() {
  return (
    <Router>
      <AppProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/swipe" replace />} />
            <Route path="/swipe" element={<SwipeScreen />} />
            <Route path="/feeds" element={<FeedManagerScreen />} />
            <Route path="/bookmarks" element={<BookmarksScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
          </Routes>
        </Layout>
      </AppProvider>
    </Router>
  );
}

export default App;
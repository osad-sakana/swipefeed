import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Fab,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '@/context/AppContext';
import { AddFeedDialog } from '@/components/AddFeedDialog';
import { SortableFeedItem } from '@/components/SortableFeedItem';
import { EmptyState } from '@/components/EmptyState';
import { Feed } from '@/types';

export function FeedManagerScreen(): JSX.Element {
  const { state, addFeed, removeFeed, updateFeed, reorderFeeds } = useAppContext();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px移動でドラッグ開始
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = state.feeds.findIndex((feed) => feed.id === active.id);
      const newIndex = state.feeds.findIndex((feed) => feed.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        try {
          await reorderFeeds(oldIndex, newIndex);
          showSnackbar('フィードの順序を更新しました', 'success');
        } catch (error) {
          showSnackbar('順序の更新に失敗しました', 'error');
        }
      }
    }
  };

  const handleAddFeed = async (url: string) => {
    try {
      await addFeed(url);
      showSnackbar('フィードを追加しました', 'success');
    } catch (error) {
      throw error; // Re-throw to let the dialog handle the error
    }
  };

  const handleToggleActive = async (feed: Feed) => {
    try {
      await updateFeed(feed);
      showSnackbar(
        feed.isActive ? 'フィードを有効にしました' : 'フィードを無効にしました',
        'success'
      );
    } catch (error) {
      showSnackbar('フィードの更新に失敗しました', 'error');
    }
  };

  const handleEditFeed = async (feed: Feed) => {
    try {
      await updateFeed(feed);
      showSnackbar('フィードを更新しました', 'success');
    } catch (error) {
      showSnackbar('フィードの更新に失敗しました', 'error');
    }
  };

  const handleDeleteFeed = async (feedId: string) => {
    try {
      await removeFeed(feedId);
      showSnackbar('フィードを削除しました', 'success');
    } catch (error) {
      showSnackbar('フィードの削除に失敗しました', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Sort feeds by order for display
  const sortedFeeds = [...state.feeds].sort((a, b) => a.order - b.order);

  if (state.feeds.length === 0) {
    return (
      <Container sx={{ padding: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" component="h1" sx={{ marginBottom: 3 }}>
          フィード管理
        </Typography>
        
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState
            title="フィードがありません"
            message="新しいRSSフィードを追加して記事の読み取りを開始しましょう。"
            buttonText="フィードを追加"
            onButtonPress={() => setAddDialogOpen(true)}
            icon="📡"
          />
        </Box>

        <AddFeedDialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          onAddFeed={handleAddFeed}
        />
      </Container>
    );
  }

  return (
    <Container sx={{ padding: 3, paddingBottom: 8, minHeight: '100vh' }}>
      <Typography variant="h4" component="h1" sx={{ marginBottom: 3 }}>
        フィード管理
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 2 }}>
        フィードをドラッグして順序を変更できます。スイッチでフィードの有効/無効を切り替えられます。
      </Typography>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <SortableContext items={sortedFeeds.map(feed => feed.id)} strategy={verticalListSortingStrategy}>
          {sortedFeeds.map((feed) => (
            <SortableFeedItem
              key={feed.id}
              feed={feed}
              onToggleActive={handleToggleActive}
              onEdit={handleEditFeed}
              onDelete={handleDeleteFeed}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
        }}
        onClick={() => setAddDialogOpen(true)}
      >
        <FontAwesomeIcon icon={faPlus} />
      </Fab>

      {/* Add Feed Dialog */}
      <AddFeedDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAddFeed={handleAddFeed}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
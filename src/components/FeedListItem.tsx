import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Switch,
  FormControlLabel,
  Box,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGripVertical,
  faEllipsisVertical,
  faEdit,
  faTrash,
  faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons';
import { Feed } from '@/types';
import { formatDate } from '@/utils/dateUtils';

interface FeedListItemProps {
  feed: Feed;
  onToggleActive: (feed: Feed) => void;
  onEdit: (feed: Feed) => void;
  onDelete: (feedId: string) => void;
  isDragging?: boolean;
}

export const FeedListItem: React.FC<FeedListItemProps> = ({
  feed,
  onToggleActive,
  onEdit,
  onDelete,
  isDragging = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(feed.title);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    setEditTitle(feed.title);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleEditSave = () => {
    if (editTitle.trim() && editTitle !== feed.title) {
      onEdit({ ...feed, title: editTitle.trim() });
    }
    setEditDialogOpen(false);
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    onDelete(feed.id);
    setDeleteConfirmOpen(false);
  };

  const handleToggleActive = () => {
    onToggleActive({ ...feed, isActive: !feed.isActive });
  };

  const handleVisitFeed = () => {
    window.open(feed.url, '_blank');
    handleMenuClose();
  };

  return (
    <>
      <Card
        sx={{
          marginBottom: 1,
          opacity: isDragging ? 0.5 : 1,
          cursor: isDragging ? 'grabbing' : 'default',
          transition: 'opacity 0.2s',
          border: !feed.isActive ? '1px solid' : 'none',
          borderColor: 'warning.main',
        }}
      >
        <CardContent sx={{ padding: 2, '&:last-child': { paddingBottom: 2 } }}>
          <Box display="flex" alignItems="center" gap={1}>
            {/* Drag Handle */}
            <Box
              sx={{
                cursor: 'grab',
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                '&:active': { cursor: 'grabbing' },
              }}
            >
              <FontAwesomeIcon icon={faGripVertical} />
            </Box>

            {/* Feed Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box display="flex" alignItems="center" gap={1} marginBottom={0.5}>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: feed.isActive ? 'text.primary' : 'text.secondary',
                    textDecoration: feed.isActive ? 'none' : 'line-through',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {feed.title}
                </Typography>
                {feed.unreadCount > 0 && (
                  <Chip
                    label={feed.unreadCount}
                    color="primary"
                    size="small"
                    sx={{ fontSize: '0.75rem', height: 20 }}
                  />
                )}
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: 0.5,
                }}
              >
                {feed.url}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                最終更新: {formatDate(feed.lastUpdated)}
              </Typography>
            </Box>

            {/* Active Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={feed.isActive}
                  onChange={handleToggleActive}
                  size="small"
                />
              }
              label=""
              sx={{ margin: 0 }}
            />

            {/* Menu Button */}
            <IconButton onClick={handleMenuOpen} size="small">
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon>
            <FontAwesomeIcon icon={faEdit} fontSize="small" />
          </ListItemIcon>
          <ListItemText>編集</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleVisitFeed}>
          <ListItemIcon>
            <FontAwesomeIcon icon={faExternalLinkAlt} fontSize="small" />
          </ListItemIcon>
          <ListItemText>フィードを開く</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <FontAwesomeIcon icon={faTrash} fontSize="small" color="inherit" />
          </ListItemIcon>
          <ListItemText>削除</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>フィードを編集</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="フィード名"
            fullWidth
            variant="outlined"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{ marginTop: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleEditSave} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>フィードを削除</DialogTitle>
        <DialogContent>
          <Typography>
            「{feed.title}」を削除しますか？このフィードに関連するすべての記事も削除されます。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>キャンセル</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
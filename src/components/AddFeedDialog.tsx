import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRss, faPlus } from '@fortawesome/free-solid-svg-icons';

interface AddFeedDialogProps {
  open: boolean;
  onClose: () => void;
  onAddFeed: (url: string) => Promise<void>;
}

export const AddFeedDialog: React.FC<AddFeedDialogProps> = ({
  open,
  onClose,
  onAddFeed,
}) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (!loading) {
      setUrl('');
      setError(null);
      onClose();
    }
  };

  const validateUrl = (inputUrl: string): boolean => {
    try {
      new URL(inputUrl);
      return true;
    } catch {
      return false;
    }
  };

  const normalizeUrl = (inputUrl: string): string => {
    let normalizedUrl = inputUrl.trim();
    
    // Add protocol if missing
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    return normalizedUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('URLを入力してください');
      return;
    }

    const normalizedUrl = normalizeUrl(url);
    
    if (!validateUrl(normalizedUrl)) {
      setError('有効なURLを入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onAddFeed(normalizedUrl);
      setUrl('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'フィードの追加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (error) {
      setError(null);
    }
  };

  const isSubmitDisabled = !url.trim() || loading;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <FontAwesomeIcon icon={faRss} />
          <Typography variant="h6" component="span">
            新しいフィードを追加
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            autoFocus
            fullWidth
            label="RSS フィード URL"
            placeholder="https://example.com/feed.xml"
            variant="outlined"
            value={url}
            onChange={handleUrlChange}
            disabled={loading}
            error={Boolean(error)}
            helperText={error || '追加したいRSSフィードのURLを入力してください'}
            sx={{ marginBottom: 2 }}
          />

          {loading && (
            <Alert severity="info" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2">
                フィードを検証しています...
              </Typography>
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>使用可能なフォーマット:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • RSS 2.0<br />
              • Atom 1.0<br />
              • RSS 1.0 (RDF)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
              テスト用: https://feeds.bbci.co.uk/news/rss.xml
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={handleClose} 
          disabled={loading}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitDisabled}
          startIcon={loading ? <CircularProgress size={16} /> : <FontAwesomeIcon icon={faPlus} />}
        >
          {loading ? '追加中...' : '追加'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
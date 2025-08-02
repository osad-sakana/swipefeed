import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FeedListItem } from './FeedListItem';
import { Feed } from '@/types';

interface SortableFeedItemProps {
  feed: Feed;
  onToggleActive: (feed: Feed) => void;
  onEdit: (feed: Feed) => void;
  onDelete: (feedId: string) => void;
}

export const SortableFeedItem: React.FC<SortableFeedItemProps> = ({
  feed,
  onToggleActive,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: feed.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <FeedListItem
        feed={feed}
        onToggleActive={onToggleActive}
        onEdit={onEdit}
        onDelete={onDelete}
        isDragging={isDragging}
      />
    </div>
  );
};
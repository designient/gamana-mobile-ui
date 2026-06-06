import { useState, useEffect, useCallback } from 'react';
import { getSavedItems, saveItem as dbSaveItem, removeSavedItem } from '../lib/localDb';
import type { SavedItem } from '../types';

export function useSavedItems() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(() => {
    setIsLoading(true);
    setItems(getSavedItems());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const saveItem = useCallback(async (itemType: 'story' | 'pack' | 'city', itemId: string) => {
    const ok = dbSaveItem(itemType, itemId);
    if (ok) fetchItems();
    return ok;
  }, [fetchItems]);

  const removeItem = useCallback(async (itemId: string) => {
    const ok = removeSavedItem(itemId);
    if (ok) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    }
    return ok;
  }, []);

  const isItemSaved = useCallback((itemType: string, itemId: string) => {
    return items.some((i) => i.item_type === itemType && i.item_id === itemId);
  }, [items]);

  return { items, isLoading, saveItem, removeItem, isItemSaved, refresh: fetchItems };
}

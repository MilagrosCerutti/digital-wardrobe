import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { ClothingItemForm } from '@/features/closet/components/ClothingItemForm';
import {
  useCreateClothingItemMutation,
  useUploadClothingImageMutation,
} from '@/features/closet/hooks/useCloset';
import type { Catalog, CreateClothingItemPayload } from '@/features/closet/types/closet.types';
import { getApiErrorMessage } from '@/utils/apiError';

export interface AddClothingItemModalProps {
  catalog: Catalog;
  isOpen: boolean;
  onClose: () => void;
}

export function AddClothingItemModal({ catalog, isOpen, onClose }: AddClothingItemModalProps) {
  const uploadImage = useUploadClothingImageMutation();
  const createItem = useCreateClothingItemMutation();
  const { toast } = useToast();

  const isSubmitting = uploadImage.isPending || createItem.isPending;

  async function handleSubmit(values: CreateClothingItemPayload, imageFile: File | null) {
    try {
      const imageUrl = imageFile ? await uploadImage.mutateAsync(imageFile) : values.imageUrl;
      await createItem.mutateAsync({ ...values, imageUrl });
      toast({ title: 'Added to your closet', variant: 'success' });
      onClose();
    } catch (error) {
      toast({ title: 'Could not add this item', description: getApiErrorMessage(error), variant: 'error' });
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add a piece to your closet">
      <ClothingItemForm
        catalog={catalog}
        submitLabel="Add Item"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}

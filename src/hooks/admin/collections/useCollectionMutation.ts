import { useMutation } from "@tanstack/react-query";
import {
  createCollection,
  updateCollection,
  deleteCollection,
} from "./collectionMutations";

export const useCollectionMutation = () => {
  const create = useMutation({
    mutationFn: createCollection,
    onError: (error) => {
      console.error("Error creating collection:", error);
    },
  });

  const update = useMutation({
    mutationFn: updateCollection,
    onError: (error) => {
      console.error("Error updating collection:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCollection,
    onError: (error) => {
      console.error("Error deleting collection:", error);
    },
  });

  return {
    create: create.mutate,
    createAsync: create.mutateAsync,
    isPending: create.isPending,

    update: update.mutate,
    updateAsync: update.mutateAsync,
    isUpdatePending: update.isPending,

    deleteCollection: deleteMutation.mutate,
    deleteCollectionAsync: deleteMutation.mutateAsync,
    isDeletePending: deleteMutation.isPending,
  };
};

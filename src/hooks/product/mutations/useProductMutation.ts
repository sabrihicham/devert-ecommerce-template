import { useMutation } from "@tanstack/react-query";
import { createProduct, updateProduct, deleteProduct } from "./productMutations";

export const useProductMutation = () => {
  const create = useMutation({
    mutationFn: createProduct,
    onError: (error) => {
      console.error("Error al crear el producto:", error);
    },
  });

  const update = useMutation({
    mutationFn: updateProduct,
    onError: (error) => {
      console.error("Error al actualizar el producto:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onError: (error) => {
      console.error("Error deleting product:", error);
    },
  });

  return {
    // Create mutations
    create: create.mutate,
    createAsync: create.mutateAsync,
    isPending: create.isPending,
    isError: create.isError,
    isSuccess: create.isSuccess,
    error: create.error,
    // Update mutations
    update: update.mutate,
    updateAsync: update.mutateAsync,
    isUpdatePending: update.isPending,
    isUpdateError: update.isError,
    isUpdateSuccess: update.isSuccess,
    updateError: update.error,
    // Delete mutations
    deleteProduct: deleteMutation.mutate,
    deleteProductAsync: deleteMutation.mutateAsync,
    isDeletePending: deleteMutation.isPending,
  };
};


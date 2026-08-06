import { useMutation } from "@tanstack/react-query";
import {
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
} from "./bannerMutations";

export const useBannerMutation = () => {
  const create = useMutation({
    mutationFn: createBanner,
    onError: (error) => {
      console.error("Error creating banner:", error);
    },
  });

  const update = useMutation({
    mutationFn: updateBanner,
    onError: (error) => {
      console.error("Error updating banner:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onError: (error) => {
      console.error("Error deleting banner:", error);
    },
  });

  const reorder = useMutation({
    mutationFn: reorderBanners,
    onError: (error) => {
      console.error("Error reordering banners:", error);
    },
  });

  return {
    create: create.mutate,
    createAsync: create.mutateAsync,
    isPending: create.isPending,

    update: update.mutate,
    updateAsync: update.mutateAsync,
    isUpdatePending: update.isPending,

    deleteBanner: deleteMutation.mutate,
    deleteBannerAsync: deleteMutation.mutateAsync,
    isDeletePending: deleteMutation.isPending,

    reorder: reorder.mutate,
    reorderAsync: reorder.mutateAsync,
    isReorderPending: reorder.isPending,
  };
};

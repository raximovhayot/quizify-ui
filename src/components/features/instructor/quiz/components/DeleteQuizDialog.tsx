"use client";

import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollableDialogContent } from "@/components/shared/ui/ScrollableDialogContent";

export interface DeleteQuizDialogProps {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteQuizDialog({
  open,
  isSubmitting,
  onClose,
  onConfirm,
}: Readonly<DeleteQuizDialogProps>) {
  const t = useTranslations();

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <ScrollableDialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("instructor.quiz.delete.dialog.title", { fallback: "Delete Quiz" })}
          </DialogTitle>
          <DialogDescription>
            {t("instructor.quiz.delete.dialog.description", {
              fallback:
                "Are you sure you want to delete this quiz? This action cannot be undone.",
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t("common.cancel", { fallback: "Cancel" })}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting
              ? t("common.deleting", { fallback: "Deleting..." })
              : t("common.delete", { fallback: "Delete" })}
          </Button>
        </DialogFooter>
      </ScrollableDialogContent>
    </Dialog>
  );
}

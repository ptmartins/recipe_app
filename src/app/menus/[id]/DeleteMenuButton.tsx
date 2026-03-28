"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useToast } from "@/components/ui/use-toast";

export function DeleteMenuButton({ menuId }: { menuId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetch(`/api/menus/${menuId}`, { method: "DELETE" });
      toast({ title: "Menu deleted" });
      router.push("/menus");
      router.refresh();
    } catch {
      toast({ title: "Failed to delete menu", variant: "destructive" });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-destructive hover:text-destructive hover:border-destructive/40 shrink-0"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Menu"
        description="This will permanently delete this menu and its shopping list. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={loading}
        destructive
      />
    </>
  );
}

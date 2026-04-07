import { toast } from "sonner";

interface ToastOptions {
  title: string;
  message?: string;
  preset?: "error" | "done" | "none" | "spinner";
}

export function showToast({ title, message, preset }: ToastOptions): void {
  if (preset === "error") {
    toast.error(title, { description: message });
  } else {
    toast.success(title, { description: message });
  }
}

import { toast } from "sonner";

interface ToastOptions {
  title: string;
  message?: string;
  preset?: "error" | "done" | "none" | "spinner";
}

export function showToast({ title, message, preset }: ToastOptions): void {
  switch (preset) {
    case "error":
      toast.error(title, { description: message });
      break;
    case "done":
      toast.success(title, { description: message });
      break;
    case "spinner":
      toast.loading(title, { description: message });
      break;
    case "none":
    default:
      toast(title, { description: message });
      break;
  }
}

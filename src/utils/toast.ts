import * as Burnt from "burnt";

interface ToastOptions {
  title: string;
  message?: string;
  preset?: "error" | "done" | "none" | "spinner";
}

export function showToast({ title, message, preset }: ToastOptions): void {
  Burnt.toast({ title, message, preset });
}

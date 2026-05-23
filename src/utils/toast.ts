import * as Burnt from "burnt";

type NativeToastPreset = "done" | "error" | "none";

interface ToastOptions {
  title: string;
  message?: string;
  preset?: NativeToastPreset;
}

export function showToast({ title, message, preset }: ToastOptions): void {
  Burnt.toast({ title, message, preset });
}

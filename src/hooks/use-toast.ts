
import * as React from "react";
import {
  Toast as ToastPrimitive,
  ToastActionElement,
  ToastProps 
} from "@/components/ui/toast";

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000000;

type ToastState = {
  toasts: ToasterToast[];
};

let count = 0;

function generateId() {
  return `${count++}`;
}

const toastState: ToastState = {
  toasts: [],
};

const listeners: Array<(state: ToastState) => void> = [];

function addToRemoveQueue(toastId: string) {
  setTimeout(() => {
    toastState.toasts = toastState.toasts.filter((t) => t.id !== toastId);
    listeners.forEach((listener) => {
      listener(toastState);
    });
  }, TOAST_REMOVE_DELAY);
}

export function toast(props: Omit<ToasterToast, "id">) {
  const id = generateId();

  const update = (props: ToasterToast) =>
    updateToast({ ...props, id });
  const dismiss = () => dismissToast(id);

  const newToast = {
    ...props,
    id,
    open: true,
    onOpenChange: (open: boolean) => {
      if (!open) dismiss();
    },
  };

  toastState.toasts = [newToast, ...toastState.toasts].slice(0, TOAST_LIMIT);

  listeners.forEach((listener) => {
    listener(toastState);
  });

  return {
    id,
    dismiss,
    update,
  };
}

function updateToast(props: ToasterToast): void {
  toastState.toasts = toastState.toasts.map((t) =>
    t.id === props.id ? { ...t, ...props } : t
  );
  listeners.forEach((listener) => {
    listener(toastState);
  });
}

function dismissToast(toastId: string): void {
  const toast = toastState.toasts.find((t) => t.id === toastId);
  if (toast) {
    toast.open = false;

    listeners.forEach((listener) => {
      listener(toastState);
    });

    window.setTimeout(() => {
      toastState.toasts = toastState.toasts.filter((t) => t.id !== toastId);
      listeners.forEach((listener) => {
        listener(toastState);
      });
    }, 300);
  }
}

export function useToast() {
  return {
    toast,
    dismiss: dismissToast,
    toasts: toastState.toasts,
  };
}

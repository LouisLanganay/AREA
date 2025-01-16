"use client";

import * as React from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

/**
 * Maximum number of toasts that can be displayed simultaneously
 */
const TOAST_LIMIT = 1;

/**
 * Delay in milliseconds before removing a dismissed toast
 */
const TOAST_REMOVE_DELAY = 1000000;

/**
 * Extended toast properties including internal management fields
 */
type ToasterToast = ToastProps & {
  id: string;                    // Unique identifier
  title?: React.ReactNode;       // Toast title
  description?: React.ReactNode; // Toast description
  action?: ToastActionElement;   // Optional action element
};

/**
 * Available toast action types
 */
type ActionType = {
  ADD_TOAST: "ADD_TOAST";
  UPDATE_TOAST: "UPDATE_TOAST";
  DISMISS_TOAST: "DISMISS_TOAST";
  REMOVE_TOAST: "REMOVE_TOAST";
};

// Counter for generating unique toast IDs
let count = 0;

/**
 * Generates a unique ID for toasts
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type Action =
  | { type: ActionType["ADD_TOAST"]; toast: ToasterToast }
  | { type: ActionType["UPDATE_TOAST"]; toast: Partial<ToasterToast> }
  | { type: ActionType["DISMISS_TOAST"]; toastId?: ToasterToast["id"] }
  | { type: ActionType["REMOVE_TOAST"]; toastId?: ToasterToast["id"] };

/**
 * State interface for toast management
 */
interface State {
  toasts: ToasterToast[];
}

// Map to store timeout IDs for toast removal
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Queues a toast for removal after delay
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

/**
 * Reducer function for managing toast state
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
  case "ADD_TOAST":
    return {
      ...state,
      toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
    };

  case "UPDATE_TOAST":
    return {
      ...state,
      toasts: state.toasts.map((t) =>
        t.id === action.toast.id ? { ...t, ...action.toast } : t
      ),
    };

  case "DISMISS_TOAST": {
    const { toastId } = action;

    // Queue toast for removal
    if (toastId) {
      addToRemoveQueue(toastId);
    } else {
      state.toasts.forEach((toast) => {
        addToRemoveQueue(toast.id);
      });
    }

    return {
      ...state,
      toasts: state.toasts.map((t) =>
        t.id === toastId || toastId === undefined
          ? {
            ...t,
            open: false,
          }
          : t
      ),
    };
  }

  case "REMOVE_TOAST":
    if (action.toastId === undefined) {
      return {
        ...state,
        toasts: [],
      };
    }
    return {
      ...state,
      toasts: state.toasts.filter((t) => t.id !== action.toastId),
    };
  }
};

// Array of state change listeners
const listeners: Array<(state: State) => void> = [];

// In-memory state storage
let memoryState: State = { toasts: [] };

/**
 * Dispatches actions and notifies listeners
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, "id">;

/**
 * Creates and manages a new toast
 */
function toast({ ...props }: Toast) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

/**
 * Hook for accessing toast functionality
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

type ToastOptions = {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
};

/**
 * Custom toast utility to standardize toast notifications across the application
 */
export const appToast = {
  /**
   * Show a success toast notification
   */
  success: (title: string, options?: ToastOptions) => {
    return toast.success(title, {
      ...options,
      icon: options?.icon || <CheckCircle className="size-5" />,
      className: "toast-success",
      duration: options?.duration || 5000,
    });
  },

  /**
   * Show an error toast notification
   */
  error: (title: string, options?: ToastOptions) => {
    return toast.error(title, {
      ...options,
      icon: options?.icon || <XCircle className="size-5" />,
      className: "toast-error",
      duration: options?.duration || 7000,
    });
  },

  /**
   * Show an info toast notification
   */
  info: (title: string, options?: ToastOptions) => {
    return toast.info(title, {
      ...options,
      icon: options?.icon || <Info className="size-5" />,
      className: "toast-info",
      duration: options?.duration || 5000,
    });
  },

  /**
   * Show a warning toast notification
   */
  warning: (title: string, options?: ToastOptions) => {
    return toast.warning(title, {
      ...options,
      icon: options?.icon || <AlertTriangle className="size-5" />,
      className: "toast-warning",
      duration: options?.duration || 6000,
    });
  },

  /**
   * Show a custom toast notification
   */
  custom: (title: string, options?: ToastOptions) => {
    return toast(title, {
      ...options,
      icon: options?.icon || <AlertCircle className="size-5" />,
      duration: options?.duration || 5000,
    });
  },

  /**
   * Show a file upload success toast notification
   */
  uploadSuccess: (fileName: string, options?: ToastOptions) => {
    return appToast.success(`File Upload Successful`, {
      description: `${fileName} has been uploaded successfully.`,
      ...options,
    });
  },

  /**
   * Show a file upload error toast notification
   */
  uploadError: (
    fileName: string,
    errorMessage?: string,
    options?: ToastOptions
  ) => {
    return appToast.error(`File Upload Failed`, {
      description:
        errorMessage || `Failed to upload ${fileName}. Please try again.`,
      ...options,
    });
  },

  /**
   * Show a quota exceeded toast notification
   */
  quotaExceeded: (message: string) => {
    return appToast.error(`Quota Exceeded`, {
      description: `${message}\n\nPlease upgrade your subscription to continue.`,
      duration: 10000,
      action: {
        label: "Upgrade",
        onClick: () =>
          window.open(
            "https://docs.powerdrill.ai/enterprise/subscriptions",
            "_blank"
          ),
      },
    });
  },

  /**
   * Show a workspace capacity error toast notification
   */
  workspaceCapacity: (message: string) => {
    return appToast.error(`Workspace Capacity Error`, {
      description: message,
      duration: 7000,
    });
  },
};

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type FeedbackType = 'success' | 'error' | 'warning' | 'loading';

interface ActionFeedbackProps {
  type: FeedbackType;
  message?: string;
  duration?: number;
  onComplete?: () => void;
  className?: string;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  loading: Loader2,
};

const colors = {
  success: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  error: 'text-red-600 bg-red-50 border-red-200',
  warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  loading: 'text-blue-600 bg-blue-50 border-blue-200',
};

export function ActionFeedback({
  type,
  message,
  duration = 3000,
  onComplete,
  className,
}: ActionFeedbackProps) {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = icons[type];

  useEffect(() => {
    if (type === 'loading') return; // Loading não desaparece automaticamente

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onComplete?.(), 300); // Aguarda animação de saída
    }, duration);

    return () => clearTimeout(timer);
  }, [type, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-down',
        colors[type],
        className
      )}
    >
      <Icon
        className={cn(
          'h-5 w-5',
          type === 'loading' && 'animate-spin'
        )}
      />
      {message && (
        <span className="text-sm font-medium">{message}</span>
      )}
    </div>
  );
}

// Hook para usar feedback de ações
export function useActionFeedback() {
  const [feedback, setFeedback] = useState<{
    type: FeedbackType;
    message?: string;
  } | null>(null);

  const showSuccess = (message?: string) => {
    setFeedback({ type: 'success', message });
  };

  const showError = (message?: string) => {
    setFeedback({ type: 'error', message });
  };

  const showWarning = (message?: string) => {
    setFeedback({ type: 'warning', message });
  };

  const showLoading = (message?: string) => {
    setFeedback({ type: 'loading', message });
  };

  const hide = () => {
    setFeedback(null);
  };

  return {
    feedback,
    showSuccess,
    showError,
    showWarning,
    showLoading,
    hide,
  };
}

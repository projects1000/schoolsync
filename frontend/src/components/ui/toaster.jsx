import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

function getToastIcon(variant, title) {
	// Auto-detect icon from variant or title content
	if (variant === 'destructive') {
		return <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />;
	}
	if (variant === 'success') {
		return <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />;
	}

	// Smart icon detection from title content
	const titleStr = typeof title === 'string' ? title.toLowerCase() : '';
	if (titleStr.includes('success') || titleStr.includes('welcome') || titleStr.includes('logged out') || titleStr.includes('saved') || titleStr.includes('created') || titleStr.includes('updated') || titleStr.includes('deleted') || titleStr.includes('switched') || titleStr.includes('🎉')) {
		return <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />;
	}
	if (titleStr.includes('error') || titleStr.includes('failed') || titleStr.includes('denied')) {
		return <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />;
	}
	if (titleStr.includes('warning') || titleStr.includes('caution')) {
		return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
	}
	if (titleStr.includes('🚧')) {
		return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
	}

	return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
}

export function Toaster() {
	const { toasts } = useToast();

	return (
		<ToastProvider>
			{toasts.map(({ id, title, description, action, variant, ...props }) => {
				const icon = getToastIcon(variant, title);
				return (
					<Toast key={id} variant={variant} {...props}>
						{/* Icon */}
						<div className="flex items-center justify-center">
							{icon}
						</div>

						{/* Content */}
						<div className="flex-1 min-w-0">
							{title && <ToastTitle>{title}</ToastTitle>}
							{description && (
								<ToastDescription>{description}</ToastDescription>
							)}
						</div>

						{/* Action + Close */}
						<div className="flex items-center gap-1 shrink-0">
							{action}
							<ToastClose />
						</div>
					</Toast>
				);
			})}
			<ToastViewport />
		</ToastProvider>
	);
}

/**
 * Shipped UI primitives — this is the complete inventory. Import from here,
 * never from the individual files:
 *
 *   import { Alert, Button, Card, EmptyState, Field, Input, Modal, Spinner }
 *     from '@/components/ui';
 *
 * These are the ONLY components that belong in this folder. Feature components
 * (NoteCard, Navbar, ProductRow, ...) live in client/src/components/ and are
 * built FROM these.
 *
 * cn() — the Tailwind class merger every className-accepting component must use
 * — lives at @/utils/cn.
 */
export { default as Alert, type AlertProps, type AlertVariant } from './Alert';
export {
  default as Button,
  buttonClass,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
} from './Button';
export { default as Card, type CardProps } from './Card';
export { default as EmptyState, type EmptyStateProps } from './EmptyState';
export { default as Field, type FieldProps } from './Field';
export { default as Input, inputClass, type InputProps } from './Input';
export { default as Modal, type ModalProps } from './Modal';
export { default as Spinner, type SpinnerProps } from './Spinner';
export { default as ToastContainer, type ToastItem, type ToastVariant } from './Toast';
export { ToastProvider } from './ToastProvider';
export { default as PageLoader } from './PageLoader';

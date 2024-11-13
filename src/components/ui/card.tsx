// src/components/ui/card.tsx
import { forwardRef } from 'react';

const Card = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className="rounded-lg border bg-white shadow-sm"
    {...props}
  />
));
Card.displayName = "Card";

export { Card };
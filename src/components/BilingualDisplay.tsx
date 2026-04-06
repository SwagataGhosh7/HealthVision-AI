/**
 * Bilingual Text Display Component
 * Elegantly displays content in dual languages when in Bengali mode
 * 
 * Features:
 * - Clean hierarchy with primary/secondary text
 * - Proper spacing and typography
 * - Responsive design with Tailwind CSS
 * - Supports different text types (title, body, suggestion)
 */

import React from 'react';
import { BilingualContent, translateAndFormat } from '@/utils/translateAndFormat';
import { cn } from '@/lib/utils';

interface BilingualTextProps {
  content: string | BilingualContent;
  currentLanguage: 'en' | 'bn';
  type?: 'title' | 'body' | 'suggestion' | 'warning';
  className?: string;
  showSecondaryAlways?: boolean;
}

/**
 * Component for displaying bilingual content
 */
export const BilingualText: React.FC<BilingualTextProps> = ({
  content,
  currentLanguage,
  type = 'body',
  className,
  showSecondaryAlways = false,
}) => {
  const formatted = translateAndFormat(content, currentLanguage);

  // Only show secondary in Bengali mode (unless explicitly requested)
  const showSecondary = (currentLanguage === 'bn' || showSecondaryAlways) && formatted.secondary;

  const baseClasses = {
    title: 'font-bold text-lg leading-relaxed',
    body: 'text-base leading-relaxed',
    suggestion: 'text-sm leading-relaxed',
    warning: 'text-sm font-semibold leading-relaxed',
  };

  if (!showSecondary) {
    return (
      <p className={cn(baseClasses[type], className)}>
        {formatted.primary}
      </p>
    );
  }

  // Bilingual display (Bengali mode)
  return (
    <div className={cn('space-y-1', className)}>
      {/* Primary text (Bengali) - Bold and darker */}
      <p className={cn(
        baseClasses[type],
        'text-foreground font-semibold',
        type === 'title' && 'text-lg',
        type === 'body' && 'text-base',
        type === 'suggestion' && 'text-sm',
        type === 'warning' && 'text-red-600'
      )}>
        {formatted.primary}
      </p>

      {/* Secondary text (English) - Lighter and smaller */}
      <p className={cn(
        'text-muted-foreground',
        type === 'title' && 'text-sm leading-relaxed',
        type === 'body' && 'text-sm leading-relaxed italic',
        type === 'suggestion' && 'text-xs leading-relaxed italic',
        type === 'warning' && 'text-xs leading-relaxed'
      )}>
        {formatted.secondary}
      </p>
    </div>
  );
};

interface BilingualCardProps {
  title: string | BilingualContent;
  content: string | BilingualContent;
  currentLanguage: 'en' | 'bn';
  icon?: React.ReactNode;
  severity?: 'mild' | 'moderate' | 'severe';
  className?: string;
}

/**
 * Card component for displaying bilingual content sections
 */
export const BilingualCard: React.FC<BilingualCardProps> = ({
  title,
  content,
  currentLanguage,
  icon,
  severity,
  className,
}) => {
  const severityStyles = {
    mild: 'border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20',
    moderate: 'border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20',
    severe: 'border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20',
  };

  return (
    <div className={cn(
      'p-4 rounded-lg',
      severity && severityStyles[severity],
      !severity && 'border border-border bg-card',
      className
    )}>
      {/* Header with icon and title */}
      <div className="flex gap-3 items-start mb-3">
        {icon && <div className="mt-1">{icon}</div>}
        <div className="flex-1">
          <BilingualText
            content={title}
            currentLanguage={currentLanguage}
            type="title"
          />
        </div>
      </div>

      {/* Content */}
      <div className={cn(icon && 'ml-8')}>
        <BilingualText
          content={content}
          currentLanguage={currentLanguage}
          type="body"
        />
      </div>
    </div>
  );
};

interface BilingualListProps {
  items: (string | BilingualContent)[];
  currentLanguage: 'en' | 'bn';
  type?: 'bullet' | 'number';
  className?: string;
}

/**
 * List component for displaying arrays of bilingual items
 */
export const BilingualList: React.FC<BilingualListProps> = ({
  items,
  currentLanguage,
  type = 'bullet',
  className,
}) => {
  const ListComponent = type === 'number' ? 'ol' : 'ul';
  const listItemClass = type === 'number'
    ? 'list-decimal list-inside'
    : 'list-disc list-inside';

  return (
    <ListComponent className={cn(listItemClass, 'space-y-2', className)}>
      {items.map((item, index) => (
        <li key={index} className="marker:font-semibold">
          <BilingualText
            content={item}
            currentLanguage={currentLanguage}
            type="suggestion"
            className="inline"
          />
        </li>
      ))}
    </ListComponent>
  );
};

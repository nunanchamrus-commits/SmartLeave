import React from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
  Inbox,
  PlusCircle,
} from 'lucide-react';

/**
 * EmptyState: คอมโพเนนต์แสดงสถานะว่างอย่างสวยงาม สไตล์ Minimal Modern
 * ผสมผสานโทนสีเขียวมรกตและเทานวล (Green & Slate) เหมาะกับระบบราชการ/สหกรณ์
 */
export default function EmptyState({
  variant = 'default', // 'default' | 'search' | 'check' | 'calendar' | 'inbox'
  title = 'ไม่พบข้อมูลในขณะนี้',
  description = 'ยังไม่มีรายการข้อมูลในระบบ หรือไม่มีข้อมูลที่ตรงกับเงื่อนไขการค้นหา',
  actionText = '',
  onAction = null,
  actionIcon: ActionIcon = PlusCircle,
  compact = false,
  className = '',
}) {
  const renderIllustration = () => {
    if (variant === 'search') {
      return (
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-emerald-50 border border-slate-200/80 flex items-center justify-center shadow-xs">
            <svg
              className="w-12 h-12 text-slate-400"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Document background */}
              <rect x="14" y="10" width="36" height="44" rx="6" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
              <line x1="22" y1="20" x2="36" y2="20" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
              <line x1="22" y1="28" x2="42" y2="28" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
              <line x1="22" y1="36" x2="34" y2="36" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
              {/* Magnifying Glass */}
              <circle cx="38" cy="38" r="10" fill="#FFFFFF" stroke="#10B981" strokeWidth="3" />
              <line x1="45" y1="45" x2="52" y2="52" stroke="#047857" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs ring-2 ring-white">
            <Search className="w-3 h-3" />
          </div>
        </div>
      );
    }

    if (variant === 'check') {
      return (
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border border-emerald-100 flex items-center justify-center shadow-xs">
            <svg
              className="w-12 h-12"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Soft decorative background circles */}
              <circle cx="32" cy="32" r="24" fill="#D1FAE5" opacity="0.6" />
              {/* Shield / Document */}
              <path
                d="M32 14L46 20V32C46 41 40 48 32 52C24 48 18 41 18 32V20L32 14Z"
                fill="#FFFFFF"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Checkmark */}
              <path
                d="M26 32L30.5 36.5L38.5 27.5"
                stroke="#047857"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center ring-2 ring-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>
      );
    }

    if (variant === 'calendar') {
      return (
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-slate-50 to-emerald-50/60 border border-slate-200/80 flex items-center justify-center shadow-xs">
            <svg
              className="w-12 h-12"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Calendar Base */}
              <rect x="14" y="16" width="36" height="36" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
              <path d="M14 24H50" stroke="#E2E8F0" strokeWidth="2" />
              {/* Calendar Top Ring Pins */}
              <line x1="22" y1="12" x2="22" y2="18" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
              <line x1="42" y1="12" x2="42" y2="18" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
              {/* Calendar Grid dots */}
              <circle cx="23" cy="32" r="2" fill="#94A3B8" />
              <circle cx="32" cy="32" r="2" fill="#94A3B8" />
              <circle cx="41" cy="32" r="2" fill="#94A3B8" />
              <circle cx="23" cy="40" r="2" fill="#94A3B8" />
              <circle cx="32" cy="40" r="2" fill="#10B981" />
              <circle cx="41" cy="40" r="2" fill="#94A3B8" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs ring-2 ring-white">
            <Calendar className="w-3 h-3" />
          </div>
        </div>
      );
    }

    // Default variant: Leaf / Clipboard / Minimal Document
    return (
      <div className="relative inline-flex items-center justify-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-white to-slate-100/70 border border-emerald-100/80 flex items-center justify-center shadow-xs">
          <svg
            className="w-12 h-12"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Sheet */}
            <rect x="18" y="12" width="34" height="42" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
            {/* Front Sheet */}
            <rect x="12" y="16" width="34" height="42" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
            {/* Header tab */}
            <rect x="22" y="12" width="14" height="6" rx="2" fill="#10B981" />
            {/* Content Lines */}
            <line x1="18" y1="28" x2="38" y2="28" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="18" y1="36" x2="32" y2="36" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            <line x1="18" y1="44" x2="26" y2="44" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
            {/* Small Green Sprout / Leaf icon on corner */}
            <path
              d="M40 38C40 38 46 38 48 42C48 46 44 48 40 48C40 44 40 38 40 38Z"
              fill="#10B981"
            />
            <path
              d="M40 48C40 48 37 43 38 41"
              stroke="#047857"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center ring-2 ring-white">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <div className={`py-6 px-4 text-center flex flex-col items-center justify-center ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
          {variant === 'search' ? (
            <Search className="w-5 h-5 text-slate-400" />
          ) : variant === 'check' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <FileText className="w-5 h-5 text-emerald-600" />
          )}
        </div>
        <p className="font-semibold text-slate-700 text-xs sm:text-sm">{title}</p>
        {description && <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">{description}</p>}
        {actionText && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors"
          >
            <ActionIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>{actionText}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`py-10 sm:py-14 px-4 sm:px-6 text-center flex flex-col items-center justify-center space-y-3.5 ${className}`}
    >
      {renderIllustration()}

      <div className="space-y-1 max-w-md">
        <h3 className="font-bold text-slate-800 text-sm sm:text-base font-prompt">{title}</h3>
        {description && (
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
            {description}
          </p>
        )}
      </div>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#2F855A] hover:bg-[#256F4A] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs hover:shadow-sm"
        >
          <ActionIcon className="w-4 h-4 text-lime-300" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}

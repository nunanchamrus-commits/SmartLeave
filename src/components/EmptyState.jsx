import React from 'react';
import { PlusCircle } from 'lucide-react';
import DinoMascot from './DinoMascot';

/**
 * EmptyState: คอมโพเนนต์แสดงสถานะว่างอย่างน่ารัก อบอุ่น และเป็นมืออาชีพ
 * โดดเด่นด้วยมาสคอตไดโนเสาร์เจ้าหน้าที่ดิจิทัล
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
  const getDinoPose = () => {
    switch (variant) {
      case 'search':
      case 'error':
        return 'error';
      case 'calendar':
        return 'holiday';
      case 'check':
      case 'inbox':
      default:
        return 'coffee';
    }
  };

  const getDinoBubble = () => {
    if (compact) return '';
    switch (variant) {
      case 'search':
      case 'error':
        return 'เอ๊ะ... ไม่พบข้อมูล ลองค้นหาด้วยคำอื่นดูนะ 🔍';
      case 'calendar':
        return 'วันนี้ปฏิบัติหน้าที่ตามปกติ มีความสุขกับการทำงานครับ 🌸';
      case 'check':
      default:
        return 'ยังไม่มีคำขอรออนุมัติ พักผ่อนให้สบายใจ ☕';
    }
  };

  if (compact) {
    return (
      <div className={`py-5 px-3 text-center flex flex-col items-center justify-center ${className}`}>
        <DinoMascot
          pose={getDinoPose()}
          size={58}
          className="mb-1"
        />
        <p className="font-bold text-slate-700 text-xs sm:text-sm font-prompt">{title}</p>
        {description && <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">{description}</p>}
        {actionText && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-2.5 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors"
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
      className={`py-8 sm:py-12 px-4 sm:px-6 text-center flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <DinoMascot
        pose={getDinoPose()}
        size={115}
        bubbleText={getDinoBubble()}
      />

      <div className="space-y-1 max-w-md pt-1">
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

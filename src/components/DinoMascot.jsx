import React from 'react';

/**
 * DinoMascot (ไดโนลีฟ - DinoLeaf 3D):
 * มาสคอตไดโนเสาร์ตัวน้อยผู้พิทักษ์ดิน เพื่อเกษตรกรไทย ประจำระบบ SmartLeave
 * สไตล์ 3D Kawaii น่ารัก เป็นมิตร อบอุ่น พร้อมเงาและแสงตกกระทบสมจริง
 *
 * รองรับหลายอิริยาบถ (pose):
 * - 'wave' / 'main': ท่าหลัก โบกมือ/ชูนิ้วโป้ง ยิ้มขยิบตาพร้อมต้นกล้า (ใช้ใน Login / ทักทาย)
 * - 'assistant' / 'tablet': ยิ้มแฉ่ง ถือแท็บเล็ตดิจิทัลแสดงหัวใจ (ใช้ใน HeroBanner แนะนำการใช้งาน)
 * - 'success' / 'cheer': ดีใจ ชูสองมือพร้อมประกายดาวรอยยิ้มสดใส (ใช้เมื่อส่งคำขอสำเร็จ)
 * - 'coffee' / 'sleep' / 'empty': หลับฝันดี ขดตัวนอนสบายใจพร้อม z z z (ใช้ใน Empty State / พักผ่อน)
 * - 'holiday' / 'farmer': ตั้งใจทำงาน สวมงอบชาวนา ปลูกต้นกล้าในดิน (ใช้ในหน้าต่างวันหยุด / ทำงาน)
 * - 'error' / 'curious': สงสัย มองขึ้นด้านบนพร้อมเครื่องหมายคำถาม ? (ใช้เมื่อเกิด Error / ค้นหาไม่พบ)
 */
export default function DinoMascot({
  pose = 'wave',
  size = 120,
  className = '',
  bubbleText = '',
  alt = 'ไดโนลีฟ (DinoLeaf) ผู้ช่วยดิจิทัล SmartLeave',
}) {
  // Mapping pose to 3D DinoLeaf assets
  const getMascotSrc = () => {
    switch (pose) {
      case 'assistant':
      case 'tablet':
        return '/mascot/dinoleaf_tablet.png';

      case 'success':
      case 'cheer':
        return '/mascot/dinoleaf_cheer.png';

      case 'coffee':
      case 'sleep':
      case 'empty':
      case 'relax':
        return '/mascot/dinoleaf_sleep.png';

      case 'holiday':
      case 'farmer':
      case 'work':
        return '/mascot/dinoleaf_farmer.png';

      case 'error':
      case 'curious':
      case 'search':
        return '/mascot/dinoleaf_curious.png';

      case 'wave':
      case 'main':
      default:
        return '/mascot/dinoleaf_main.png';
    }
  };

  const imageSrc = getMascotSrc();

  return (
    <div className={`relative inline-flex flex-col items-center select-none group ${className}`}>
      {/* Speech Bubble (ถ้ามีการส่ง bubbleText มา) */}
      {bubbleText && (
        <div className="relative mb-2 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-xs text-slate-800 text-xs font-semibold shadow-md border border-emerald-100 max-w-xs animate-fade-in-up z-10">
          <p className="leading-snug text-center font-prompt">{bubbleText}</p>
          {/* Arrow */}
          <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-emerald-100 rotate-45" />
        </div>
      )}

      {/* 3D DinoLeaf Mascot Container with Soft 3D Glow & Smooth Hover */}
      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-105 group-hover:-translate-y-1"
      >
        <img
          src={imageSrc}
          alt={alt}
          className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(16,185,129,0.22)] select-none pointer-events-none"
          loading="eager"
          draggable="false"
        />
      </div>
    </div>
  );
}

import React from 'react';

/**
 * DinoMascot: มาสคอตไดโนเสาร์ผู้ช่วยดิจิทัลประจำระบบ SmartLeave
 * คาแรกเตอร์เจ้าหน้าที่การ์ตูนไดโนเสาร์น่ารักเรียบร้อย สวมชุดเจ้าหน้าที่สหกรณ์
 * รองรับหลายอิริยาบถ (pose):
 * - 'wave': โบกมือทักทายพร้อมสมุดจด (ใช้ในหน้า Login / ต้อนรับ)
 * - 'assistant': ผู้ช่วยดิจิทัลพร้อมชุดหูฟัง แนะนำการใช้งาน (ใช้ใน HeroBanner)
 * - 'success': ชูนิ้วโป้ง / ถือเอกสารมีเครื่องหมายถูก พร้อมพลุเฉลิมฉลอง (ใช้เมื่อส่งใบลาสำเร็จ)
 * - 'coffee': นั่งจิบกาแฟสบายใจ / ถือแฟ้มว่าง (ใช้ใน Empty State)
 * - 'holiday': ใส่ชุดธีมวันหยุด ถือพวงมาลัย/เทศกาลไทย (ใช้ในหน้าต่างวันหยุด)
 * - 'error': ถือแว่นขยายเกาหัวแบบสุภาพ (ใช้ในหน้า Error / ค้นหาไม่พบ)
 */
export default function DinoMascot({
  pose = 'wave',
  size = 120,
  className = '',
  bubbleText = '',
}) {
  const renderDinoSvg = () => {
    switch (pose) {
      case 'assistant':
        return (
          <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md select-none" fill="none">
            {/* Background glow */}
            <circle cx="80" cy="85" r="55" fill="#DCFCE7" opacity="0.6" />

            {/* Tail */}
            <path d="M42 110 C25 118 20 98 12 102 C10 108 24 128 48 124 Z" fill="#10B981" />
            <path d="M22 102 L26 108 L18 108 Z" fill="#FDE047" />

            {/* Dino Body */}
            <ellipse cx="80" cy="104" rx="36" ry="32" fill="#10B981" />
            {/* Dino Belly (Cream/Yellow) */}
            <ellipse cx="80" cy="108" rx="24" ry="24" fill="#FEF08A" opacity="0.9" />

            {/* Officer Uniform / Smart Vest */}
            <path d="M60 92 C68 90 92 90 100 92 C100 114 96 122 80 126 C64 122 60 114 60 92 Z" fill="#134E4A" opacity="0.85" />
            {/* Collar & Tie */}
            <path d="M72 90 L80 100 L88 90 Z" fill="#FFFFFF" />
            <path d="M78 96 L82 96 L84 112 L80 116 L76 112 Z" fill="#F59E0B" />
            {/* Small ID Badge */}
            <rect x="88" y="104" width="7" height="10" rx="1.5" fill="#FFFFFF" stroke="#047857" strokeWidth="0.8" />
            <line x1="90" y1="107" x2="93" y2="107" stroke="#10B981" strokeWidth="1" />

            {/* Dino Feet */}
            <ellipse cx="62" cy="132" rx="10" ry="7" fill="#059669" />
            <ellipse cx="98" cy="132" rx="10" ry="7" fill="#059669" />
            <circle cx="58" cy="133" r="2" fill="#FEF08A" />
            <circle cx="62" cy="134" r="2" fill="#FEF08A" />
            <circle cx="66" cy="133" r="2" fill="#FEF08A" />
            <circle cx="94" cy="133" r="2" fill="#FEF08A" />
            <circle cx="98" cy="134" r="2" fill="#FEF08A" />
            <circle cx="102" cy="133" r="2" fill="#FEF08A" />

            {/* Dino Head */}
            <path d="M52 58 C52 38 70 30 92 30 C114 30 122 44 122 60 C122 76 108 84 88 84 C66 84 52 74 52 58 Z" fill="#10B981" />
            {/* Cute Snout */}
            <path d="M96 46 C112 46 126 52 126 64 C126 74 114 80 98 80 C88 80 82 76 82 68 C82 56 88 46 96 46 Z" fill="#34D399" />
            {/* Little Nostrils */}
            <circle cx="116" cy="62" r="1.5" fill="#065F46" />
            <circle cx="122" cy="62" r="1.5" fill="#065F46" />

            {/* Soft Dorsal Spikes (Soft Yellow/Orange) */}
            <polygon points="56,34 62,22 68,34" fill="#FDE047" />
            <polygon points="72,30 78,18 84,30" fill="#FDE047" />
            <polygon points="88,30 94,18 100,30" fill="#FDE047" />

            {/* Cute Cheeks */}
            <ellipse cx="78" cy="68" rx="5" ry="3" fill="#FDA4AF" opacity="0.8" />
            <ellipse cx="112" cy="68" rx="4" ry="2.5" fill="#FDA4AF" opacity="0.8" />

            {/* Big Friendly Eyes with Highlights */}
            <circle cx="76" cy="52" r="6" fill="#1E293B" />
            <circle cx="74.5" cy="50" r="2.2" fill="#FFFFFF" />
            <circle cx="78" cy="54" r="1" fill="#FFFFFF" />

            <circle cx="98" cy="52" r="6" fill="#1E293B" />
            <circle cx="96.5" cy="50" r="2.2" fill="#FFFFFF" />
            <circle cx="100" cy="54" r="1" fill="#FFFFFF" />

            {/* Sweet Smile */}
            <path d="M102 68 Q108 73 114 68" stroke="#065F46" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Headset for AI Assistant */}
            <path d="M68 52 C66 36 104 34 104 50" stroke="#0284C7" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="68" cy="54" r="5" fill="#0284C7" />
            <circle cx="104" cy="52" r="4" fill="#0284C7" />
            {/* Headset Mic */}
            <path d="M68 56 Q72 70 88 70" stroke="#0284C7" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="89" cy="70" r="2" fill="#38BDF8" />

            {/* Left Arm Pointing Up / Presenting */}
            <path d="M48 94 C42 86 38 78 44 72 C48 68 56 78 52 90 Z" fill="#10B981" />
            {/* Right Arm Holding Digital Tablet */}
            <rect x="100" y="86" width="22" height="28" rx="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" transform="rotate(-10 100 86)" />
            <rect x="103" y="89" width="16" height="20" rx="1.5" fill="#ECFDF5" transform="rotate(-10 103 89)" />
            <line x1="106" y1="94" x2="114" y2="92" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="105" y1="99" x2="116" y2="97" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
            <ellipse cx="102" cy="105" rx="4" ry="4" fill="#059669" />
          </svg>
        );

      case 'success':
        return (
          <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md select-none" fill="none">
            {/* Confetti & Stars */}
            <circle cx="25" cy="35" r="3" fill="#F59E0B" />
            <circle cx="135" cy="30" r="3.5" fill="#EC4899" />
            <circle cx="140" cy="70" r="2.5" fill="#10B981" />
            <circle cx="20" cy="75" r="3" fill="#3B82F6" />
            <polygon points="32,20 34,26 40,28 34,30 32,36 30,30 24,28 30,26" fill="#FDE047" />
            <polygon points="124,18 126,23 131,25 126,27 124,32 122,27 117,25 122,23" fill="#FDE047" />
            {/* Streamers */}
            <path d="M18 45 Q26 50 20 60 Q15 70 24 75" stroke="#EC4899" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M136 40 Q144 48 138 56 Q132 64 140 70" stroke="#3B82F6" strokeWidth="1.8" fill="none" strokeLinecap="round" />

            {/* Dino Body */}
            <ellipse cx="80" cy="106" rx="36" ry="32" fill="#10B981" />
            <ellipse cx="80" cy="110" rx="24" ry="24" fill="#FEF08A" opacity="0.9" />

            {/* Officer Uniform / Tie */}
            <path d="M60 94 C68 92 92 92 100 94 C100 114 96 122 80 126 C64 122 60 114 60 94 Z" fill="#134E4A" opacity="0.85" />
            <path d="M72 92 L80 102 L88 92 Z" fill="#FFFFFF" />
            <path d="M78 98 L82 98 L84 112 L80 116 L76 112 Z" fill="#F59E0B" />

            {/* Dino Feet */}
            <ellipse cx="62" cy="134" rx="10" ry="7" fill="#059669" />
            <ellipse cx="98" cy="134" rx="10" ry="7" fill="#059669" />

            {/* Dino Head */}
            <path d="M52 58 C52 38 70 30 92 30 C114 30 122 44 122 60 C122 76 108 84 88 84 C66 84 52 74 52 58 Z" fill="#10B981" />
            <path d="M96 46 C112 46 126 52 126 64 C126 74 114 80 98 80 C88 80 82 76 82 68 C82 56 88 46 96 46 Z" fill="#34D399" />
            <circle cx="116" cy="62" r="1.5" fill="#065F46" />
            <circle cx="122" cy="62" r="1.5" fill="#065F46" />

            {/* Spikes */}
            <polygon points="56,34 62,22 68,34" fill="#FDE047" />
            <polygon points="72,30 78,18 84,30" fill="#FDE047" />
            <polygon points="88,30 94,18 100,30" fill="#FDE047" />

            {/* Cheeks - Extra Rosy */}
            <ellipse cx="78" cy="68" rx="6" ry="3.5" fill="#F43F5E" opacity="0.75" />
            <ellipse cx="112" cy="68" rx="5" ry="3" fill="#F43F5E" opacity="0.75" />

            {/* Happy Eyes (Winking / Curved Smiling Eyes) */}
            <path d="M72 52 Q76 46 80 52" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M94 52 Q98 46 102 52" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />

            {/* Open Happy Mouth */}
            <path d="M100 66 Q108 78 116 66 Z" fill="#BE123C" />
            <path d="M103 69 Q108 74 113 69" fill="#FB7185" />

            {/* Left Arm: Big Thumbs Up! */}
            <path d="M48 94 C40 90 32 80 34 72 C36 68 44 70 42 76 C40 82 46 86 52 92 Z" fill="#10B981" />
            {/* Thumb */}
            <ellipse cx="36" cy="68" rx="3.5" ry="5.5" fill="#059669" transform="rotate(-15 36 68)" />

            {/* Right Arm Holding Approved Document with Green Checkmark */}
            <rect x="94" y="82" width="28" height="36" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" transform="rotate(8 94 82)" />
            {/* Top gold header on certificate */}
            <rect x="98" y="85" width="20" height="4" rx="1" fill="#F59E0B" transform="rotate(8 98 85)" />
            <line x1="102" y1="95" x2="114" y2="97" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="101" y1="101" x2="112" y2="103" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
            {/* Big Green Stamp with Checkmark */}
            <circle cx="112" cy="106" r="6" fill="#10B981" />
            <path d="M109 106 L111.5 108.5 L115.5 104" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <ellipse cx="98" cy="106" rx="4.5" ry="4" fill="#059669" />
          </svg>
        );

      case 'coffee':
        return (
          <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md select-none" fill="none">
            {/* Cozy Soft Background */}
            <circle cx="80" cy="85" r="54" fill="#F1F5F9" opacity="0.8" />

            {/* Relaxed Sitting Dino Body */}
            <ellipse cx="80" cy="110" rx="38" ry="28" fill="#10B981" />
            <ellipse cx="80" cy="114" rx="24" ry="20" fill="#FEF08A" opacity="0.9" />

            {/* Green Uniform Vest */}
            <path d="M60 98 C68 96 92 96 100 98 C100 114 96 122 80 126 C64 122 60 114 60 98 Z" fill="#134E4A" opacity="0.85" />
            <path d="M72 96 L80 106 L88 96 Z" fill="#FFFFFF" />
            <path d="M78 102 L82 102 L84 116 L80 120 L76 116 Z" fill="#F59E0B" />

            {/* Cute Sitting Legs Folded */}
            <ellipse cx="54" cy="126" rx="12" ry="7" fill="#059669" transform="rotate(-10 54 126)" />
            <ellipse cx="106" cy="126" rx="12" ry="7" fill="#059669" transform="rotate(10 106 126)" />

            {/* Head Slightly Tilted Relaxed */}
            <g transform="rotate(4 80 60)">
              <path d="M52 58 C52 38 70 30 92 30 C114 30 122 44 122 60 C122 76 108 84 88 84 C66 84 52 74 52 58 Z" fill="#10B981" />
              <path d="M96 46 C112 46 126 52 126 64 C126 74 114 80 98 80 C88 80 82 76 82 68 C82 56 88 46 96 46 Z" fill="#34D399" />
              <circle cx="116" cy="62" r="1.5" fill="#065F46" />
              <circle cx="122" cy="62" r="1.5" fill="#065F46" />

              <polygon points="56,34 62,22 68,34" fill="#FDE047" />
              <polygon points="72,30 78,18 84,30" fill="#FDE047" />
              <polygon points="88,30 94,18 100,30" fill="#FDE047" />

              <ellipse cx="78" cy="68" rx="5" ry="3" fill="#FDA4AF" opacity="0.8" />
              <ellipse cx="112" cy="68" rx="4" ry="2.5" fill="#FDA4AF" opacity="0.8" />

              {/* Gentle Peaceful Closed Eyes */}
              <path d="M72 54 Q76 58 80 54" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M94 54 Q98 58 102 54" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              {/* Calm smile */}
              <path d="M102 68 Q108 72 114 68" stroke="#065F46" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>

            {/* Coffee Mug with Steaming Vapor */}
            <rect x="70" y="102" width="20" height="18" rx="4" fill="#0D9488" />
            <path d="M90 106 C94 106 96 110 96 112 C96 114 94 116 90 116" stroke="#0D9488" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Coffee Steam */}
            <path d="M76 96 Q74 92 78 88" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M82 95 Q84 90 80 86" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />

            {/* Two Paws Gently Holding Mug */}
            <ellipse cx="68" cy="111" rx="4" ry="4" fill="#059669" />
            <ellipse cx="92" cy="111" rx="4" ry="4" fill="#059669" />
          </svg>
        );

      case 'holiday':
        return (
          <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md select-none" fill="none">
            {/* Festival Sunlight Glow */}
            <circle cx="80" cy="85" r="54" fill="#FEF3C7" opacity="0.7" />

            {/* Dino Body */}
            <ellipse cx="80" cy="106" rx="36" ry="32" fill="#10B981" />
            <ellipse cx="80" cy="110" rx="24" ry="24" fill="#FEF08A" opacity="0.9" />

            {/* Traditional Thai Pattern Sash / Silk Ribbon (สไบ/ผ้าพาดไหล่สีทอง) */}
            <path d="M60 88 C70 94 88 114 92 126 L80 128 C74 116 62 100 56 94 Z" fill="#F59E0B" />
            <path d="M60 88 C68 92 84 108 88 120" stroke="#FDE047" strokeWidth="1.2" strokeLinecap="round" fill="none" />

            {/* Feet */}
            <ellipse cx="62" cy="134" rx="10" ry="7" fill="#059669" />
            <ellipse cx="98" cy="134" rx="10" ry="7" fill="#059669" />

            {/* Head with Festive Dok Rak / Flower Garland Accent */}
            <path d="M52 58 C52 38 70 30 92 30 C114 30 122 44 122 60 C122 76 108 84 88 84 C66 84 52 74 52 58 Z" fill="#10B981" />
            <path d="M96 46 C112 46 126 52 126 64 C126 74 114 80 98 80 C88 80 82 76 82 68 C82 56 88 46 96 46 Z" fill="#34D399" />
            <circle cx="116" cy="62" r="1.5" fill="#065F46" />
            <circle cx="122" cy="62" r="1.5" fill="#065F46" />

            <polygon points="56,34 62,22 68,34" fill="#FDE047" />
            <polygon points="72,30 78,18 84,30" fill="#FDE047" />
            <polygon points="88,30 94,18 100,30" fill="#FDE047" />

            {/* Cheeks */}
            <ellipse cx="78" cy="68" rx="5" ry="3" fill="#FDA4AF" opacity="0.8" />
            <ellipse cx="112" cy="68" rx="4" ry="2.5" fill="#FDA4AF" opacity="0.8" />

            {/* Sparkly Big Eyes */}
            <circle cx="76" cy="52" r="6" fill="#1E293B" />
            <circle cx="74.5" cy="50" r="2.2" fill="#FFFFFF" />
            <circle cx="78" cy="54" r="1" fill="#FFFFFF" />

            <circle cx="98" cy="52" r="6" fill="#1E293B" />
            <circle cx="96.5" cy="50" r="2.2" fill="#FFFFFF" />
            <circle cx="100" cy="54" r="1" fill="#FFFFFF" />

            <path d="M102 68 Q108 74 114 68" stroke="#065F46" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Flower on Ear (ดอกชบา / ดอกไม้ประดับหู) */}
            <circle cx="62" cy="38" r="4" fill="#EC4899" />
            <circle cx="66" cy="36" r="4" fill="#EC4899" />
            <circle cx="68" cy="41" r="4" fill="#EC4899" />
            <circle cx="64" cy="44" r="4" fill="#EC4899" />
            <circle cx="60" cy="42" r="4" fill="#EC4899" />
            <circle cx="64" cy="40" r="2.5" fill="#FDE047" />

            {/* Paws Holding Thai Jasmine Garland (พวงมาลัย) */}
            <ellipse cx="72" cy="108" rx="4" ry="4" fill="#059669" />
            <ellipse cx="88" cy="108" rx="4" ry="4" fill="#059669" />
            {/* The Garland Circle */}
            <circle cx="80" cy="112" r="8" stroke="#FFFFFF" strokeWidth="3.5" fill="none" />
            <circle cx="80" cy="112" r="8" stroke="#34D399" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            {/* Ribbon & Tassels (อุบะ) */}
            <circle cx="80" cy="120" r="2.5" fill="#EC4899" />
            <line x1="78" y1="122" x2="77" y2="128" stroke="#F59E0B" strokeWidth="1.5" />
            <line x1="82" y1="122" x2="83" y2="128" stroke="#F59E0B" strokeWidth="1.5" />
            <circle cx="77" cy="129" r="1.5" fill="#EF4444" />
            <circle cx="83" cy="129" r="1.5" fill="#EF4444" />
          </svg>
        );

      case 'error':
        return (
          <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md select-none" fill="none">
            {/* Soft Gray/Amber Glow */}
            <circle cx="80" cy="85" r="54" fill="#FEF3C7" opacity="0.6" />

            {/* Question Mark floating */}
            <text x="32" y="42" fontSize="22" fontWeight="bold" fill="#F59E0B" fontFamily="Prompt, sans-serif">?</text>
            <text x="122" y="48" fontSize="16" fontWeight="bold" fill="#F59E0B" fontFamily="Prompt, sans-serif">?</text>

            {/* Body */}
            <ellipse cx="80" cy="106" rx="36" ry="32" fill="#10B981" />
            <ellipse cx="80" cy="110" rx="24" ry="24" fill="#FEF08A" opacity="0.9" />

            {/* Uniform Vest */}
            <path d="M60 94 C68 92 92 92 100 94 C100 114 96 122 80 126 C64 122 60 114 60 94 Z" fill="#134E4A" opacity="0.85" />
            <path d="M72 92 L80 102 L88 92 Z" fill="#FFFFFF" />
            <path d="M78 98 L82 98 L84 112 L80 116 L76 112 Z" fill="#F59E0B" />

            {/* Feet */}
            <ellipse cx="62" cy="134" rx="10" ry="7" fill="#059669" />
            <ellipse cx="98" cy="134" rx="10" ry="7" fill="#059669" />

            {/* Head Tilted in Curiosity */}
            <g transform="rotate(-6 80 60)">
              <path d="M52 58 C52 38 70 30 92 30 C114 30 122 44 122 60 C122 76 108 84 88 84 C66 84 52 74 52 58 Z" fill="#10B981" />
              <path d="M96 46 C112 46 126 52 126 64 C126 74 114 80 98 80 C88 80 82 76 82 68 C82 56 88 46 96 46 Z" fill="#34D399" />
              <circle cx="116" cy="62" r="1.5" fill="#065F46" />
              <circle cx="122" cy="62" r="1.5" fill="#065F46" />

              <polygon points="56,34 62,22 68,34" fill="#FDE047" />
              <polygon points="72,30 78,18 84,30" fill="#FDE047" />
              <polygon points="88,30 94,18 100,30" fill="#FDE047" />

              <ellipse cx="78" cy="68" rx="5" ry="3" fill="#FDA4AF" opacity="0.8" />
              <ellipse cx="112" cy="68" rx="4" ry="2.5" fill="#FDA4AF" opacity="0.8" />

              {/* One eye big, one eye smaller (quizzical look) */}
              <circle cx="76" cy="52" r="7" fill="#1E293B" />
              <circle cx="74" cy="50" r="2.5" fill="#FFFFFF" />

              <circle cx="98" cy="53" r="5" fill="#1E293B" />
              <circle cx="96.5" cy="51.5" r="1.8" fill="#FFFFFF" />

              {/* Puzzled wavy mouth */}
              <path d="M100 68 Q106 65 110 70 Q114 67 116 69" stroke="#065F46" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>

            {/* Left Arm Scratching Head Politely */}
            <path d="M60 92 C50 82 46 68 56 58 C60 54 66 60 62 68 C60 72 62 82 64 90 Z" fill="#10B981" />
            <ellipse cx="58" cy="56" rx="4" ry="4" fill="#059669" />

            {/* Right Arm Holding Magnifying Glass */}
            <circle cx="118" cy="94" r="10" stroke="#0D9488" strokeWidth="3" fill="#ECFDF5" opacity="0.8" />
            <line x1="110" y1="102" x2="102" y2="110" stroke="#047857" strokeWidth="3.5" strokeLinecap="round" />
            <ellipse cx="103" cy="108" rx="4" ry="4" fill="#059669" />
          </svg>
        );

      case 'wave':
      default:
        return (
          <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md select-none" fill="none">
            {/* Friendly Green Soft Glow */}
            <circle cx="80" cy="85" r="54" fill="#DCFCE7" opacity="0.7" />

            {/* Tail */}
            <path d="M42 110 C25 118 20 98 12 102 C10 108 24 128 48 124 Z" fill="#10B981" />
            <path d="M22 102 L26 108 L18 108 Z" fill="#FDE047" />

            {/* Dino Body */}
            <ellipse cx="80" cy="106" rx="36" ry="32" fill="#10B981" />
            <ellipse cx="80" cy="110" rx="24" ry="24" fill="#FEF08A" opacity="0.9" />

            {/* Officer Uniform / Tie */}
            <path d="M60 94 C68 92 92 92 100 94 C100 114 96 122 80 126 C64 122 60 114 60 94 Z" fill="#134E4A" opacity="0.85" />
            <path d="M72 92 L80 102 L88 92 Z" fill="#FFFFFF" />
            <path d="M78 98 L82 98 L84 112 L80 116 L76 112 Z" fill="#F59E0B" />
            <rect x="88" y="104" width="7" height="10" rx="1.5" fill="#FFFFFF" stroke="#047857" strokeWidth="0.8" />
            <line x1="90" y1="107" x2="93" y2="107" stroke="#10B981" strokeWidth="1" />

            {/* Feet */}
            <ellipse cx="62" cy="134" rx="10" ry="7" fill="#059669" />
            <ellipse cx="98" cy="134" rx="10" ry="7" fill="#059669" />

            {/* Head */}
            <path d="M52 58 C52 38 70 30 92 30 C114 30 122 44 122 60 C122 76 108 84 88 84 C66 84 52 74 52 58 Z" fill="#10B981" />
            <path d="M96 46 C112 46 126 52 126 64 C126 74 114 80 98 80 C88 80 82 76 82 68 C82 56 88 46 96 46 Z" fill="#34D399" />
            <circle cx="116" cy="62" r="1.5" fill="#065F46" />
            <circle cx="122" cy="62" r="1.5" fill="#065F46" />

            {/* Spikes */}
            <polygon points="56,34 62,22 68,34" fill="#FDE047" />
            <polygon points="72,30 78,18 84,30" fill="#FDE047" />
            <polygon points="88,30 94,18 100,30" fill="#FDE047" />

            {/* Cheeks */}
            <ellipse cx="78" cy="68" rx="5" ry="3" fill="#FDA4AF" opacity="0.8" />
            <ellipse cx="112" cy="68" rx="4" ry="2.5" fill="#FDA4AF" opacity="0.8" />

            {/* Big Friendly Eyes */}
            <circle cx="76" cy="52" r="6" fill="#1E293B" />
            <circle cx="74.5" cy="50" r="2.2" fill="#FFFFFF" />
            <circle cx="78" cy="54" r="1" fill="#FFFFFF" />

            <circle cx="98" cy="52" r="6" fill="#1E293B" />
            <circle cx="96.5" cy="50" r="2.2" fill="#FFFFFF" />
            <circle cx="100" cy="54" r="1" fill="#FFFFFF" />

            {/* Big Welcoming Smile */}
            <path d="M102 68 Q108 74 114 68" stroke="#065F46" strokeWidth="2.2" strokeLinecap="round" fill="none" />

            {/* Left Arm Waving High (โบกมือทักทาย) */}
            <path d="M48 94 C38 88 32 76 34 64 C36 60 42 62 42 68 C42 74 46 84 52 90 Z" fill="#10B981" />
            <ellipse cx="35" cy="62" rx="4.5" ry="5.5" fill="#059669" transform="rotate(20 35 62)" />
            {/* Motion Lines for Waving Hand */}
            <path d="M26 56 C28 50 32 46 36 44" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M22 62 C24 58 28 54 32 52" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" fill="none" />

            {/* Right Arm Holding Leather Notebook/Folder (สมุดจดบันทึก) */}
            <rect x="94" y="86" width="22" height="28" rx="3" fill="#B45309" stroke="#78350F" strokeWidth="1.2" transform="rotate(-6 94 86)" />
            <rect x="97" y="89" width="16" height="22" rx="1.5" fill="#FEF3C7" transform="rotate(-6 97 89)" />
            <line x1="100" y1="95" x2="110" y2="94" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="100" y1="100" x2="108" y2="99" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
            <ellipse cx="96" cy="104" rx="4" ry="4" fill="#059669" />
          </svg>
        );
    }
  };

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Speech Bubble (ถ้ามีการส่ง bubbleText มา) */}
      {bubbleText && (
        <div className="relative mb-2 px-3.5 py-2 rounded-2xl bg-white text-slate-800 text-xs font-semibold shadow-md border border-emerald-100 max-w-xs animate-fade-in-up">
          <p className="leading-snug text-center">{bubbleText}</p>
          {/* Arrow */}
          <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-emerald-100 rotate-45" />
        </div>
      )}

      {/* Dinosaur Mascot Body */}
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-105"
      >
        {renderDinoSvg()}
      </div>
    </div>
  );
}

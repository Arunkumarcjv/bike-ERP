import React from 'react';

/**
 * High-fidelity inline SVG bike silhouette renderer
 * Body types: commuter, sports, cruiser, adventure, scooter, ev
 * Tinted by colour hex
 */
export function BikeThumb({ bodyType = 'commuter', color = '#2563EB', className = 'w-16 h-12' }) {
  const normalizedType = (bodyType || 'commuter').toLowerCase();

  switch (normalizedType) {
    case 'sports':
      return (
        <svg viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Wheels */}
          <circle cx="25" cy="50" r="14" stroke="#334155" strokeWidth="4" />
          <circle cx="25" cy="50" r="5" fill="#64748B" />
          <circle cx="95" cy="50" r="14" stroke="#334155" strokeWidth="4" />
          <circle cx="95" cy="50" r="5" fill="#64748B" />
          {/* Sports Frame & Fairing */}
          <path d="M25 50L45 35L60 38L80 26L95 50" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M48 35L62 24H82L92 36L80 44L60 44Z" fill={color} />
          <path d="M82 24L88 18H94" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
          {/* Exhaust */}
          <path d="M50 48L78 48L88 42" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          {/* Windshield */}
          <path d="M82 24L86 16L92 18" fill="#38BDF8" fillOpacity="0.6" />
        </svg>
      );

    case 'cruiser':
      return (
        <svg viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Wheels */}
          <circle cx="24" cy="50" r="15" stroke="#334155" strokeWidth="4" />
          <circle cx="24" cy="50" r="6" fill="#64748B" />
          <circle cx="96" cy="50" r="15" stroke="#334155" strokeWidth="4" />
          <circle cx="96" cy="50" r="6" fill="#64748B" />
          {/* Cruiser Low Slung Frame & Tear-drop Tank */}
          <path d="M24 50L44 42L62 44L82 32L96 50" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
          <path d="M52 36C52 30 68 28 78 34L76 42H54Z" fill={color} />
          {/* High Handlebars */}
          <path d="M78 34L82 18L76 16" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          {/* Scooped Seat */}
          <path d="M42 38C46 42 54 42 58 38" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
          {/* Long Chrome Exhaust */}
          <path d="M46 50L88 50L98 48" stroke="#CBD5E1" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );

    case 'adventure':
      return (
        <svg viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Spoke Wheels with Big Front */}
          <circle cx="24" cy="50" r="14" stroke="#334155" strokeWidth="4" />
          <circle cx="96" cy="46" r="17" stroke="#334155" strokeWidth="4" />
          {/* Tall Adventure Stance */}
          <path d="M24 50L45 36L64 36L85 24L96 46" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M52 36L65 24H78L88 32L78 40H58Z" fill={color} />
          {/* Tall Windscreen */}
          <path d="M82 22L86 10L91 14" fill="#38BDF8" fillOpacity="0.5" stroke="#0284C7" strokeWidth="1" />
          {/* Upswept Exhaust */}
          <path d="M52 46L74 46L88 36" stroke="#94A3B8" strokeWidth="3.5" strokeLinecap="round" />
          {/* Rear Luggage Rack */}
          <path d="M30 36H44" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'scooter':
      return (
        <svg viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Small 10-12 inch Wheels */}
          <circle cx="28" cy="52" r="11" stroke="#334155" strokeWidth="3.5" />
          <circle cx="28" cy="52" r="4" fill="#64748B" />
          <circle cx="92" cy="52" r="11" stroke="#334155" strokeWidth="3.5" />
          <circle cx="92" cy="52" r="4" fill="#64748B" />
          {/* Step-through Floorboard Body */}
          <path d="M28 52L46 44L56 50H74L86 32L92 52" stroke="#0F172A" strokeWidth="2.5" />
          <path d="M34 44C34 36 48 34 60 38L62 48H44Z" fill={color} />
          <path d="M74 50L84 32H90L86 52H74Z" fill={color} />
          {/* Apron Handlebar */}
          <path d="M85 30L88 20H82" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          {/* Seat */}
          <path d="M42 36C48 36 58 36 64 38" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" />
        </svg>
      );

    case 'ev':
      return (
        <svg viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Modern Alloy Wheels */}
          <circle cx="28" cy="52" r="11" stroke="#0F172A" strokeWidth="3.5" />
          <circle cx="28" cy="52" r="4" fill="#22C55E" />
          <circle cx="92" cy="52" r="11" stroke="#0F172A" strokeWidth="3.5" />
          <circle cx="92" cy="52" r="4" fill="#22C55E" />
          {/* Sleek Minimalist Aero Monocoque */}
          <path d="M30 46L48 42L58 50H76L88 30L92 52" stroke="#0F172A" strokeWidth="2.5" />
          <path d="M34 44L52 32H72L88 28L84 50H68L60 44H42Z" fill={color} />
          {/* Green Electric Glow Accent */}
          <path d="M58 40L64 36L61 42L68 42L59 48L61 44Z" fill="#22C55E" />
          {/* Sleek Flush Handlebar */}
          <path d="M85 28L88 18H80" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'commuter':
    default:
      return (
        <svg viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Wheels */}
          <circle cx="25" cy="50" r="14" stroke="#334155" strokeWidth="3.5" />
          <circle cx="25" cy="50" r="5" fill="#64748B" />
          <circle cx="95" cy="50" r="14" stroke="#334155" strokeWidth="3.5" />
          <circle cx="95" cy="50" r="5" fill="#64748B" />
          {/* Commuter Diamond Frame & Tank */}
          <path d="M25 50L48 38L66 40L84 28L95 50" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          <path d="M52 38L65 28H78L84 36L74 42H56Z" fill={color} />
          <path d="M82 28L85 18H78" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
          {/* Seat */}
          <path d="M42 36C48 36 58 36 65 38" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
          {/* Exhaust */}
          <path d="M50 48L80 48L90 46" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
  }
}

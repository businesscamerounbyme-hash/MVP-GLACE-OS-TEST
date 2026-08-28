'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Store, BarChart2, MapPin, User, ShieldCheck } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Accueil',
      href: '/',
      icon: Sparkles,
      isActive: pathname === '/'
    },
    {
      name: 'Boutiques',
      href: '/boutiques',
      icon: Store,
      isActive: pathname.startsWith('/boutiques')
    },
    {
      name: 'Comparateur',
      href: '/comparateur',
      icon: BarChart2,
      isActive: pathname.startsWith('/comparateur')
    },
    {
      name: 'Carte',
      href: '/carte',
      icon: MapPin,
      isActive: pathname.startsWith('/carte')
    },
    {
      name: 'Mon Espace',
      href: '/espace',
      icon: User,
      isActive: pathname.startsWith('/espace') || pathname.startsWith('/membre') || pathname.startsWith('/fournisseur') || pathname.startsWith('/admin')
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-slate-800/90 shadow-mobile-nav px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                item.isActive
                  ? 'text-amber-400 bg-amber-500/10 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${item.isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

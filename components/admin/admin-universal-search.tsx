'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { adminNav } from '@/lib/data/admin';

export function AdminUniversalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const q = query.trim().toLowerCase();

  const navResults = q
    ? adminNav.filter((item) => item.label.toLowerCase().includes(q) || item.group.toLowerCase().includes(q))
    : [];

  const hasResults = navResults.length > 0;

  return (
    <div ref={containerRef} className="relative hidden md:block w-80">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search admin, users, courses, payments..."
          className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-8 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-12 z-50 rounded-2xl border border-border bg-card p-3 shadow-2xl animate-in fade-in-50 zoom-in-95">
          {!hasResults ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-4">
              {/* Pages / Navigation */}
              {navResults.length > 0 && (
                <div>
                  <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Modules & Pages
                  </p>
                  <div className="space-y-1">
                    {navResults.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium hover:bg-secondary transition-colors"
                      >
                        <span className="text-foreground">{item.label}</span>
                        <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                          {item.group}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';

export interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  review: string;
}

export function TestimonialCard({ name, role, avatar, rating, review }: Testimonial) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  return (
    <Card className="card-premium card-premium-hover h-full p-6 flex flex-col">
      <Quote className="h-8 w-8 text-primary/20" />
      <div className="mt-2 flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cnStar(i < rating)}
          />
        ))}
      </div>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground">"{review}"</p>
      <div className="mt-6 flex items-center gap-3 pt-4 border-t border-border">
        <Avatar>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-brand-gradient text-white text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </Card>
  );
}

function cnStar(filled: boolean) {
  return filled ? 'h-4 w-4 fill-amber-400 text-amber-400' : 'h-4 w-4 text-muted-foreground/40';
}

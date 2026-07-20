'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Clock, Users, ArrowRight } from 'lucide-react';
import { getIcon } from '@/lib/icons';

export interface CourseCardProps {
  title: string;
  instructor: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  reviews: number;
  duration: string;
  students: number;
  price: string;
  oldPrice?: string;
  progress?: number;
  icon: string;
  gradient?: string;
  href?: string;
}

const LEVEL_STYLES: Record<CourseCardProps['level'], string> = {
  Beginner: 'bg-success/10 text-success',
  Intermediate: 'bg-warning/10 text-warning',
  Advanced: 'bg-destructive/10 text-destructive',
};

export function CourseCard({
  title,
  instructor,
  category,
  level,
  rating,
  reviews,
  duration,
  students,
  price,
  oldPrice,
  progress,
  icon,
  gradient = 'from-primary to-accent',
  href = '/courses',
}: CourseCardProps) {
  const Icon = getIcon(icon);
  return (
    <Link href={href} className="group block">
      <Card className="card-premium card-premium-hover overflow-hidden h-full">
        {/* Cover */}
        <div className={cn('relative h-36 bg-gradient-to-br', gradient)}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
          {Icon && (
            <Icon className="absolute bottom-4 left-4 h-10 w-10 text-white/90" />
          )}
          <Badge className="absolute top-3 right-3 bg-white/90 text-foreground border-transparent">
            {category}
          </Badge>
        </div>

        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', LEVEL_STYLES[level])}>
              {level}
            </span>
            <div className="flex items-center gap-1 text-xs font-medium text-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {rating}
              <span className="text-muted-foreground">({reviews})</span>
            </div>
          </div>

          <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">by {instructor}</p>

          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {duration}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> {students.toLocaleString()}
            </span>
          </div>

          {progress !== undefined && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-muted-foreground">Progress</span>
                <span className="font-semibold text-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-xl font-bold text-foreground">{price}</span>
              {oldPrice && (
                <span className="text-sm text-muted-foreground line-through">{oldPrice}</span>
              )}
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-all group-hover:bg-brand-gradient group-hover:text-white">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

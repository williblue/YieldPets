'use client';

import React from 'react';
import { ActivityEvent } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/gameLogic';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Sparkles, 
  Shield, 
  TrendingUp, 
  TrendingDown,
  Clock
} from 'lucide-react';

interface ActivityTimelineProps {
  events: ActivityEvent[];
  limit?: number;
}

export function ActivityTimeline({ events, limit }: ActivityTimelineProps) {
  const displayEvents = limit ? events.slice(0, limit) : events;

  const getIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'deposit':
        return <ArrowUpCircle className="w-5 h-5 text-vault-success" />;
      case 'withdraw':
        return <ArrowDownCircle className="w-5 h-5 text-vault-danger" />;
      case 'mint':
        return <Sparkles className="w-5 h-5 text-vault-accent" />;
      case 'armor_unlock':
        return <Shield className="w-5 h-5 text-purple-400" />;
      case 'level_up':
        return <TrendingUp className="w-5 h-5 text-vault-success" />;
      case 'level_down':
        return <TrendingDown className="w-5 h-5 text-vault-warning" />;
      default:
        return <Clock className="w-5 h-5 text-vault-muted" />;
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-vault-accent" />
            Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="w-10 h-10 text-vault-muted mx-auto mb-3" />
            <p className="text-vault-muted">No activity yet</p>
            <p className="text-sm text-vault-muted mt-1">
              Make your first deposit to start!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-vault-accent" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayEvents.map((event, index) => (
            <div 
              key={event.id}
              className={`
                flex items-start gap-3 pb-4
                ${index !== displayEvents.length - 1 ? 'border-b border-vault-border' : ''}
              `}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">{event.description}</p>
                {event.amount && (
                  <p className={`text-sm font-medium ${
                    event.type === 'deposit' ? 'text-vault-success' : 
                    event.type === 'withdraw' ? 'text-vault-danger' : 
                    'text-vault-muted'
                  }`}>
                    {event.type === 'deposit' ? '+' : '-'}{formatCurrency(event.amount)}
                  </p>
                )}
              </div>
              <div className="text-xs text-vault-muted flex-shrink-0">
                {formatTime(event.timestamp)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

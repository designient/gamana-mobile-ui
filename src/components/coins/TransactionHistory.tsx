import { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowDownLeft, ArrowUpRight, Gift } from 'lucide-react';
import type { CoinTransaction } from '../../types';

interface TransactionHistoryProps {
  transactions: CoinTransaction[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getTransactionIcon(type: string) {
  switch (type) {
    case 'welcome_bonus':
    case 'earn_reward':
      return { icon: Gift, bg: 'bg-amber-50', color: 'text-amber-500' };
    case 'purchase':
      return { icon: ArrowDownLeft, bg: 'bg-emerald-50', color: 'text-emerald-500' };
    case 'coupon_redeem':
      return { icon: Gift, bg: 'bg-emerald-50', color: 'text-emerald-500' };
    default:
      return { icon: ArrowUpRight, bg: 'bg-surface-alt', color: 'text-secondary' };
  }
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  if (transactions.length === 0) return null;

  const visible = expanded ? transactions : transactions.slice(0, 3);

  return (
    <div className="px-5 pt-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full mb-3 px-1"
      >
        <h3 className="text-sm font-semibold text-heading">Activity</h3>
        {transactions.length > 3 && (
          <div className="flex items-center gap-1 text-xs text-gamana-500 font-medium">
            <span>{expanded ? 'Show less' : 'Show all'}</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        )}
      </button>

      <div className="bg-surface rounded-2xl shadow-card overflow-hidden divide-y divide-border-subtle">
        {visible.map((tx) => {
          const { icon: Icon, bg, color } = getTransactionIcon(tx.transaction_type);
          const isCredit = tx.amount > 0;

          return (
            <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon size={14} className={color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-heading truncate">{tx.description}</p>
                <p className="text-[10px] text-muted mt-0.5">{formatDate(tx.created_at)}</p>
              </div>
              <span className={`text-sm font-semibold whitespace-nowrap ${
                isCredit ? 'text-emerald-600' : 'text-secondary'
              }`}>
                {isCredit ? '+' : ''}{tx.amount}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

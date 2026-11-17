import { CircleAlert, Hourglass, Inbox, RotateCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

type Kind = 'error' | 'offline' | 'timeout' | 'empty';

const icons: Record<Kind, { icon: React.ReactNode; tone: string }> = {
  error: {
    icon: <CircleAlert size={22} aria-hidden="true" />,
    tone: 'bg-coral-soft text-coral-ink',
  },
  timeout: {
    icon: <Hourglass size={22} aria-hidden="true" />,
    tone: 'bg-amber-soft text-amber-ink',
  },
  offline: { icon: <WifiOff size={22} aria-hidden="true" />, tone: 'bg-[#ECEEF3] text-ink-2' },
  empty: { icon: <Inbox size={22} aria-hidden="true" />, tone: 'bg-accent-soft text-accent-ink' },
};

type StoreMessageProps = {
  kind: Kind;
  title: string;
  body: string;
  action: string;
  onAction: () => void;
};

/** Full-width store state (error, offline, timeout, empty search). Errors are announced. */
export function StoreMessage({ kind, title, body, action, onAction }: StoreMessageProps) {
  const { icon, tone } = icons[kind];
  return (
    <div
      role={kind === 'empty' ? undefined : 'alert'}
      className="col-span-full flex animate-tin flex-col items-center gap-2.5 rounded-lg border border-dashed border-[#D3D8E1] px-6 py-14 text-center text-ink-2"
    >
      <span className={cn('grid size-[46px] place-items-center rounded-[13px]', tone)}>{icon}</span>
      <h3 className="mt-1 mb-0 text-[17px] text-ink">{title}</h3>
      <p className="m-0 max-w-[360px] text-[13.5px] leading-[1.55]">{body}</p>
      <Button size="sm" variant={kind === 'error' ? 'ink' : 'secondary'} onClick={onAction}>
        {kind !== 'empty' && <RotateCw size={16} aria-hidden="true" />}
        {action}
      </Button>
    </div>
  );
}

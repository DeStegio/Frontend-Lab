import { Check, RotateCcw } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { NavLink } from 'react-router';
import { SkipLink } from '@/components/layout/SkipLink';
import { Button, ButtonAnchor } from '@/components/ui/Button';
import { GithubIcon } from '@/components/ui/icons';
import { Logo } from '@/components/ui/Logo';
import { StatusPill } from '@/components/ui/StatusPill';
import { DemoStore } from '@/features/demo-store/components/DemoStore';
import { useDemoStore } from '@/features/demo-store/useDemoStore';
import { useDevice, type Device } from '@/hooks/useDevice';
import { cn } from '@/lib/cn';
import { REPO_URL, ROUTES } from '@/lib/links';
import { useSimulation } from '@/simulation/adapters/hooks';
import { SimulationProvider } from '@/simulation/adapters/SimulationProvider';
import { activeConditions, CONDITION_COUNT } from '@/simulation/conditions';
import { ChaosControls } from './controls/ChaosControls';
import { MutationControls } from './controls/MutationControls';
import { NetworkControls } from './controls/NetworkControls';
import { StressControls } from './controls/StressControls';
import { DetailsPanel } from './DetailsPanel';
import { Dock, PresetButtons } from './Dock';
import { MobileSheet } from './MobileSheet';
import { PreviewFrame } from './PreviewFrame';
import { useLab, type Lab } from './useLab';
import './playground.css';

const navLink =
  'inline-flex h-9 items-center rounded-sm px-3 text-sm font-semibold text-ink-2 no-underline hover:bg-surface-2 hover:text-ink';

export function PlaygroundPage() {
  return (
    <SimulationProvider>
      <title>Playground | Frontend Lab</title>
      <Playground />
    </SimulationProvider>
  );
}

function Playground() {
  const device = useDevice();
  const store = useDemoStore();
  const lab = useLab(store);
  const config = useSimulation((s) => s.config);
  const conditions = useMemo(() => activeConditions(config), [config]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [renderedCards, setRenderedCards] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toggleDetails = useCallback(() => setDetailsOpen((o) => !o), []);
  const activeText = `${conditions.length} of ${CONDITION_COUNT} conditions active`;

  return (
    <div
      data-device={device}
      className={cn(
        'flex flex-col bg-paper',
        device === 'tablet' ? 'min-h-dvh' : 'h-dvh min-h-[600px] overflow-hidden',
      )}
    >
      <SkipLink />
      <AppBar device={device} lab={lab} conditionCount={conditions.length} />

      <main id="main" aria-label="Playground" className="lab-stage lab-dots">
        <PreviewFrame store={store} device={device} conditions={conditions} scrollRef={scrollRef}>
          <DemoStore store={store} scrollRef={scrollRef} onRenderedCountChange={setRenderedCards} />
        </PreviewFrame>

        {device === 'mobile' ? (
          <MobileSheet open={sheetOpen} onClose={() => setSheetOpen(false)} subtitle={activeText}>
            <div
              className="flex flex-none gap-1.5 overflow-x-auto pb-0.5"
              role="group"
              aria-label="Presets"
            >
              <PresetButtons lab={lab} />
            </div>
            <Clusters lab={lab} />
          </MobileSheet>
        ) : (
          <div role="region" aria-label="Experiment controls" className="contents">
            <Clusters lab={lab} />
          </div>
        )}

        <Dock
          lab={lab}
          device={device}
          conditions={conditions}
          detailsOpen={detailsOpen}
          onToggleDetails={toggleDetails}
          sheetOpen={sheetOpen}
          onOpenSheet={() => setSheetOpen(true)}
        />

        {detailsOpen && (
          <DetailsPanel
            device={device}
            renderedCards={renderedCards}
            totalItems={config.mutation.itemCount}
            onClose={() => setDetailsOpen(false)}
          />
        )}

        {lab.resetNote && (
          <div
            role="status"
            className={cn(
              'absolute z-22 flex animate-tin items-center gap-2.5 rounded-md border border-mint-line bg-surface py-2.5 pr-4 pl-3 text-[13px] text-ink-2 shadow-3',
              device === 'mobile'
                ? 'inset-x-2.5 bottom-[84px]'
                : 'top-4 left-1/2 -translate-x-1/2 whitespace-nowrap',
            )}
          >
            <span
              aria-hidden="true"
              className="grid size-6 flex-none place-items-center rounded-[7px] bg-mint-soft text-mint-ink"
            >
              <Check size={14} />
            </span>
            <span>
              <b className="text-ink">Fresh start.</b> Conditions cleared, requests cancelled, cart
              emptied.
            </span>
          </div>
        )}
      </main>
    </div>
  );
}

function Clusters({ lab }: { lab: Lab }) {
  return (
    <>
      <NetworkControls className="lab-net" />
      <StressControls className="lab-int" onRunClicks={() => lab.runClicks()} />
      <MutationControls className="lab-mut" />
      <ChaosControls className="lab-chaos" lab={lab} />
    </>
  );
}

function AppBar({
  device,
  lab,
  conditionCount,
}: {
  device: Device;
  lab: Lab;
  conditionCount: number;
}) {
  const inFlight = useSimulation((s) => s.stats.inFlight);
  const chaos = useSimulation((s) => s.config.chaos.enabled);
  const busy = inFlight > 0;
  const mobile = device === 'mobile';
  const flight = busy ? ` · ${inFlight} in flight` : '';

  const text = mobile
    ? chaos
      ? 'Chaos'
      : conditionCount
        ? `${conditionCount} active`
        : busy
          ? `${inFlight} in flight`
          : 'Idle'
    : chaos
      ? `Chaos mode${flight}`
      : conditionCount
        ? `${conditionCount} ${conditionCount === 1 ? 'condition' : 'conditions'} active${flight}`
        : busy
          ? `${inFlight} in flight`
          : 'Idle · normal conditions';

  return (
    <header className="relative z-3 flex h-16 flex-none items-center gap-5 border-b border-line bg-surface px-6 lab-mobile:h-14 lab-mobile:gap-2.5 lab-mobile:px-3">
      <Logo compact={mobile} />
      {!mobile && (
        <nav aria-label="Main" className="flex gap-1">
          <NavLink
            to={ROUTES.playground}
            className={({ isActive }) =>
              cn(
                navLink,
                isActive && 'bg-surface-2 text-ink shadow-[inset_0_0_0_1px_var(--color-line)]',
              )
            }
          >
            Playground
          </NavLink>
          <NavLink to={ROUTES.about} className={navLink}>
            About
          </NavLink>
        </nav>
      )}
      <div className="flex-1" />
      <StatusPill
        tone={chaos ? 'chaos' : conditionCount || busy ? 'active' : 'idle'}
        busy={busy}
        className={mobile ? 'h-8 px-2.5 text-xs' : undefined}
      >
        {text}
      </StatusPill>
      <Button
        size="sm"
        onClick={lab.resetAll}
        aria-label="Reset all conditions"
        className={mobile ? 'h-10' : undefined}
      >
        <RotateCcw size={16} aria-hidden="true" />
        {!mobile && <span>Reset all</span>}
      </Button>
      {!mobile && (
        <ButtonAnchor
          href={REPO_URL}
          size="sm"
          variant="ghost"
          icon
          aria-label="Frontend Lab on GitHub"
        >
          <GithubIcon />
        </ButtonAnchor>
      )}
    </header>
  );
}

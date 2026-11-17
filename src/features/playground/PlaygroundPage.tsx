import { Check, CodeXml, FireExtinguisher, SlidersHorizontal, Unplug } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { SkipLink } from '@/components/layout/SkipLink';
import { ToyAnchor, ToyButton } from '@/components/toy/toy';
import { ChaosIcon, GithubIcon } from '@/components/ui/icons';
import { Logo } from '@/components/ui/Logo';
import { DemoStore } from '@/features/demo-store/components/DemoStore';
import { useDemoStore } from '@/features/demo-store/useDemoStore';
import { useDevice, type Device } from '@/hooks/useDevice';
import { cn } from '@/lib/cn';
import { REPO_URL, ROUTES } from '@/lib/links';
import { useEngine, useSimulation } from '@/simulation/adapters/hooks';
import { SimulationProvider } from '@/simulation/adapters/SimulationProvider';
import { activeConditions, CONDITION_COUNT } from '@/simulation/conditions';
import { DetailsPanel } from './DetailsPanel';
import { serverMood } from './fun/mood';
import { ServerMascot } from './fun/ServerMascot';
import { TrafficLane } from './fun/TrafficLane';
import { useIncidents } from './fun/useIncidents';
import { MobileSheet } from './MobileSheet';
import { Modes } from './Modes';
import { ChaosModule } from './modules/ChaosModule';
import { MutationModule } from './modules/MutationModule';
import { NetworkModule } from './modules/NetworkModule';
import { StressModule } from './modules/StressModule';
import { Screen } from './Screen';
import { IncidentLog, SidePanel } from './SidePanel';
import { useLab, type Lab } from './useLab';
import './playground.css';

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
  const incidents = useIncidents();
  const config = useSimulation((s) => s.config);
  const conditions = useMemo(() => activeConditions(config), [config]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [renderedCards, setRenderedCards] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toggleDetails = useCallback(() => setDetailsOpen((o) => !o), []);
  const mobile = device === 'mobile';

  const deck = (
    <>
      <NetworkModule />
      <StressModule onRunClicks={() => lab.runClicks()} />
      <MutationModule />
      <ChaosModule lab={lab} />
    </>
  );

  return (
    <div
      data-device={device}
      data-chaos={config.chaos.enabled || undefined}
      className={cn(
        'flex flex-col bg-cream font-toy text-toy-ink',
        device === 'tablet' ? 'min-h-dvh' : 'h-dvh min-h-[640px] overflow-hidden',
      )}
    >
      <SkipLink />
      <LabHeader device={device} lab={lab} conditionCount={conditions.length} />

      <main
        id="main"
        aria-label="Playground"
        className={cn('lab-stage toy-dots', lab.shaking && 'lab-shake')}
      >
        <Screen
          store={store}
          lab={lab}
          device={device}
          conditions={conditions}
          scrollRef={scrollRef}
        >
          <DemoStore store={store} scrollRef={scrollRef} onRenderedCountChange={setRenderedCards} />
        </Screen>

        <TrafficLane
          className="lab-lane"
          compact={mobile}
          action={
            mobile ? undefined : (
              <ToyButton
                size="sm"
                tone={detailsOpen ? 'sky' : 'paper'}
                onClick={toggleDetails}
                aria-expanded={detailsOpen}
                className="flex-none"
              >
                <CodeXml size={15} strokeWidth={2.6} aria-hidden="true" />
                Technical details
              </ToyButton>
            )
          }
        />

        {mobile ? (
          <>
            <p
              className="lab-ticker toy-surface m-0 truncate px-3 py-2 text-[13px] font-medium"
              aria-hidden="true"
            >
              {incidents[0]?.text}
            </p>
            <MobileBar
              lab={lab}
              conditionCount={conditions.length}
              sheetOpen={sheetOpen}
              onOpenSheet={() => setSheetOpen(true)}
              detailsOpen={detailsOpen}
              onToggleDetails={toggleDetails}
            />
            <MobileSheet
              open={sheetOpen}
              onClose={() => setSheetOpen(false)}
              subtitle={`${conditions.length} of ${CONDITION_COUNT} conditions active`}
            >
              <Modes lab={lab} className="flex-col items-start" />
              {deck}
              <IncidentLog incidents={incidents} className="max-h-72" />
            </MobileSheet>
          </>
        ) : (
          <>
            {device === 'tablet' && <Modes lab={lab} className="lab-modes" />}
            <SidePanel incidents={incidents} />
            <div role="region" aria-label="Control deck" className="lab-deck">
              {deck}
            </div>
          </>
        )}

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
              'toy-surface absolute z-22 flex animate-pop items-center gap-2.5 bg-leaf py-2.5 pr-4 pl-3 text-[14px] font-semibold',
              mobile ? 'inset-x-2.5 top-3' : 'top-5 left-1/2 -translate-x-1/2 whitespace-nowrap',
            )}
          >
            <span
              aria-hidden="true"
              className="grid size-7 flex-none place-items-center rounded-lg border-2 border-toy-ink bg-toy-paper"
            >
              <Check size={15} strokeWidth={3} />
            </span>
            <span>
              <b className="font-black">Fresh start.</b> Conditions cleared, requests cancelled,
              cart emptied.
            </span>
          </div>
        )}
      </main>
    </div>
  );
}

type HeaderProps = { device: Device; lab: Lab; conditionCount: number };

function LabHeader({ device, lab, conditionCount }: HeaderProps) {
  const inFlight = useSimulation((s) => s.stats.inFlight);
  const config = useSimulation((s) => s.config);
  const stats = useSimulation((s) => s.stats);
  const chaos = config.chaos.enabled;
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
    <header className="relative z-3 flex h-[68px] flex-none items-center gap-4 border-b-[2.5px] border-toy-ink bg-cream px-5 lab-mobile:h-14 lab-mobile:gap-2 lab-mobile:px-3">
      <Logo compact={mobile} />
      {device === 'desktop' && <Modes lab={lab} className="ml-2" />}
      <div className="flex-1" />
      {mobile && <ServerMascot mood={serverMood(config, stats)} size={34} />}
      <div
        role="status"
        aria-live="polite"
        className="led h-9 gap-2 px-3 text-[11px] uppercase"
        data-level={chaos ? 'hot' : conditionCount || busy ? 'warn' : 'ok'}
      >
        <span
          aria-hidden="true"
          className={cn('size-2 rounded-full bg-current', busy && 'animate-pulse')}
        />
        {text}
      </div>
      {!mobile && (
        <>
          <Link
            to={ROUTES.about}
            className="font-toy text-sm font-bold text-toy-ink underline decoration-2 underline-offset-4 hover:text-tomato-dark"
          >
            About
          </Link>
        </>
      )}
      <ToyButton
        size="sm"
        tone="tomato"
        onClick={lab.resetAll}
        aria-label="Reset all conditions"
        className={mobile ? 'h-10 px-2.5' : undefined}
      >
        <FireExtinguisher size={16} strokeWidth={2.6} aria-hidden="true" />
        {!mobile && <span>Reset all</span>}
      </ToyButton>
      {!mobile && (
        <ToyAnchor
          href={REPO_URL}
          size="sm"
          className="w-[34px] px-0"
          aria-label="Frontend Lab on GitHub"
        >
          <GithubIcon size={17} />
        </ToyAnchor>
      )}
    </header>
  );
}

type MobileBarProps = {
  lab: Lab;
  conditionCount: number;
  sheetOpen: boolean;
  onOpenSheet: () => void;
  detailsOpen: boolean;
  onToggleDetails: () => void;
};

function MobileBar({
  lab,
  conditionCount,
  sheetOpen,
  onOpenSheet,
  detailsOpen,
  onToggleDetails,
}: MobileBarProps) {
  const engine = useEngine();
  const offline = useSimulation((s) => s.config.network.offline);
  const chaos = useSimulation((s) => s.config.chaos.enabled);
  return (
    <div className="lab-bar flex items-center gap-2 pb-1">
      <ToyButton
        tone="sky"
        className="h-11 min-w-0 flex-1 px-3"
        onClick={onOpenSheet}
        aria-expanded={sheetOpen}
        aria-haspopup="dialog"
      >
        <SlidersHorizontal size={16} strokeWidth={2.6} aria-hidden="true" />
        Controls
        <span className="led h-6 min-w-0 px-1.5 text-[10px]">{conditionCount}</span>
      </ToyButton>
      <ToyButton
        tone={offline ? 'tomato' : 'paper'}
        className="h-11 px-3"
        aria-pressed={offline}
        onClick={() => engine.setConfig({ network: { offline: !offline } })}
      >
        <Unplug size={16} strokeWidth={2.6} aria-hidden="true" />
        Offline
      </ToyButton>
      <ToyButton
        tone="tomato"
        className="h-11 px-3"
        aria-pressed={chaos}
        disabled={lab.countdown !== null}
        onClick={() => (chaos ? lab.calmDown() : lab.engageChaos())}
      >
        <ChaosIcon size={16} />
        Chaos
      </ToyButton>
      <ToyButton
        tone={detailsOpen ? 'sky' : 'paper'}
        className="size-11 flex-none px-0"
        onClick={onToggleDetails}
        aria-label="Technical details"
        aria-expanded={detailsOpen}
      >
        <CodeXml size={18} strokeWidth={2.6} aria-hidden="true" />
      </ToyButton>
    </div>
  );
}

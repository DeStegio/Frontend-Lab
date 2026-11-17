import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ToyButton, ToyFader, ToyKeys, ToySwitch } from './toy';

describe('ToyButton', () => {
  it('defaults to type=button and fires from the keyboard', async () => {
    const onClick = vi.fn();
    render(<ToyButton onClick={onClick}>Run</ToyButton>);
    const btn = screen.getByRole('button', { name: 'Run' });
    expect(btn).toHaveAttribute('type', 'button');
    btn.focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('ToySwitch', () => {
  it('is a labelled switch that toggles with Space', async () => {
    function Harness() {
      const [on, setOn] = useState(false);
      return <ToySwitch label="Offline" checked={on} onCheckedChange={setOn} />;
    }
    render(<Harness />);
    const sw = screen.getByRole('switch', { name: 'Offline' });
    sw.focus();
    await userEvent.keyboard(' ');
    expect(sw).toBeChecked();
  });
});

describe('ToyFader', () => {
  it('labels the native slider, exposes its value and fills to the value', () => {
    render(
      <ToyFader
        label="Latency"
        value={15}
        min={0}
        max={60}
        step={0.5}
        display="15 s"
        level="hot"
        onChange={() => {}}
      />,
    );
    const slider = screen.getByRole('slider', { name: 'Latency' });
    expect(slider).toHaveAttribute('aria-valuetext', '15 s');
    expect(slider).toHaveAttribute('data-level', 'hot');
    expect(slider.style.getPropertyValue('--fill')).toBe('25%');
  });
});

describe('ToyKeys', () => {
  it('keeps the selected key pressed', async () => {
    const onChange = vi.fn();
    render(
      <ToyKeys
        label="Rapid clicks"
        value={25}
        onChange={onChange}
        options={[
          { value: 10, label: '×10' },
          { value: 25, label: '×25' },
        ]}
      />,
    );
    expect(screen.getByRole('group', { name: 'Rapid clicks' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '×25' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: '×10' }));
    expect(onChange).toHaveBeenCalledWith(10);
  });
});

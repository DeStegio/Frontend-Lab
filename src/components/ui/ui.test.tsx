import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';
import { RangeField } from './RangeField';
import { SegmentedControl } from './SegmentedControl';
import { Switch } from './Switch';

describe('Button', () => {
  it('defaults to type=button and fires onClick from the keyboard', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Run</Button>);
    const btn = screen.getByRole('button', { name: 'Run' });
    expect(btn).toHaveAttribute('type', 'button');
    btn.focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('Switch', () => {
  it('toggles with Space and reports checked state', async () => {
    function Harness() {
      const [on, setOn] = useState(false);
      return (
        <label>
          Offline
          <Switch checked={on} onCheckedChange={setOn} />
        </label>
      );
    }
    render(<Harness />);
    const sw = screen.getByRole('switch', { name: 'Offline' });
    expect(sw).not.toBeChecked();
    sw.focus();
    await userEvent.keyboard(' ');
    expect(sw).toBeChecked();
  });
});

describe('RangeField', () => {
  it('labels the slider and exposes a readable value', () => {
    render(
      <RangeField
        label="Latency"
        value={12}
        min={0}
        max={60}
        step={0.5}
        display="12 s"
        level="hot"
        onChange={() => {}}
      />,
    );
    const slider = screen.getByRole('slider', { name: 'Latency' });
    expect(slider).toHaveAttribute('aria-valuetext', '12 s');
    expect(slider).toHaveAttribute('data-level', 'hot');
  });
});

describe('SegmentedControl', () => {
  it('marks the selected option as pressed', async () => {
    const onChange = vi.fn();
    render(
      <>
        <span id="l">Rapid clicks</span>
        <SegmentedControl
          labelledBy="l"
          value={25}
          onChange={onChange}
          options={[
            { value: 10, label: '×10' },
            { value: 25, label: '×25' },
          ]}
        />
      </>,
    );
    expect(screen.getByRole('button', { name: '×25' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: '×10' }));
    expect(onChange).toHaveBeenCalledWith(10);
  });
});

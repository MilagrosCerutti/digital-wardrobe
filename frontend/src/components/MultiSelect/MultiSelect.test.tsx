import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MultiSelect } from './MultiSelect';

const OPTIONS = [
  { value: 'red', label: 'Red' },
  { value: 'blue', label: 'Blue' },
];

describe('MultiSelect', () => {
  it('shows the placeholder when nothing is selected', () => {
    render(<MultiSelect options={OPTIONS} values={[]} onChange={vi.fn()} placeholder="Pick colors" />);

    expect(screen.getByText('Pick colors')).toBeInTheDocument();
  });

  it('adds a value when an unselected option is chosen', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MultiSelect options={OPTIONS} values={[]} onChange={onChange} />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('option', { name: 'Red' }));

    expect(onChange).toHaveBeenCalledWith(['red']);
  });

  it('removes a value when an already-selected option is chosen again', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MultiSelect options={OPTIONS} values={['red', 'blue']} onChange={onChange} />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('option', { name: 'Red' }));

    expect(onChange).toHaveBeenCalledWith(['blue']);
  });

  it('resolves badge labels for a selected value from allOptions when it is missing from the scoped options list', () => {
    const ALL_OPTIONS = [...OPTIONS, { value: 'green', label: 'Green' }];
    render(
      <MultiSelect
        options={OPTIONS}
        allOptions={ALL_OPTIONS}
        values={['green']}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Green')).toBeInTheDocument();
  });
});

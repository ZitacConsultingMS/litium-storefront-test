import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tag from './Tag';

describe('Tag', () => {
  test('should not render tag if input text is empty', () => {
    render(<Tag text="" onRemove={() => {}}></Tag>);
    expect(screen.queryByTestId('tag')).not.toBeInTheDocument();
  });
  test('should render tag if input text is available', () => {
    render(<Tag text="foo" onRemove={() => {}}></Tag>);
    expect(screen.queryByTestId('tag')).toBeInTheDocument();
    expect(screen.getByTestId('tag').textContent).toBe('foo');
  });
  test('should render icon if available', () => {
    render(
      <Tag
        text="foo"
        onRemove={() => {}}
        icon={<i data-testid="tag__icon"></i>}
      ></Tag>
    );
    expect(screen.queryByTestId('tag__icon')).toBeInTheDocument();
  });
  test('should call onRemove function when removing tag', async () => {
    console.log = jest.fn();
    render(
      <Tag
        text="foo"
        onRemove={(text) => {
          console.log(text);
        }}
      ></Tag>
    );
    await userEvent.click(screen.getByTestId('tag__remove'));
    expect(console.log).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('foo');
  });
});

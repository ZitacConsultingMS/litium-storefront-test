import { fireEvent, render, screen } from '@testing-library/react';
import { Tab, Tabs } from './Tabs';

describe('Tabs', () => {
  test('should render all tabs correctly when input 2 tabs', () => {
    render(
      <Tabs>
        <Tab header="Header1">
          <div>Panel1</div>
        </Tab>
        <Tab header="Header2">
          <div>Panel2</div>
        </Tab>
      </Tabs>
    );
    expect(screen.queryAllByTestId('tabs__header').length).toBe(2);
    expect(screen.getByTestId('tabs__panel')).toBeVisible();
    expect(screen.queryAllByTestId('tabs__header')[0].textContent).toEqual(
      'Header1'
    );
    expect(screen.queryAllByTestId('tabs__header')[1].textContent).toEqual(
      'Header2'
    );
    expect(screen.getByTestId('tabs__panel').textContent).toEqual('Panel1');
  });
  test('should call onTabChange function with correct active tab after selecting a tab', () => {
    const onTabChange = jest.fn();
    render(
      <Tabs onTabChange={onTabChange}>
        <Tab header="Header1">
          <div>Panel1</div>
        </Tab>
        <Tab header="Header2">
          <div>Panel2</div>
        </Tab>
        <Tab header="Header3">
          <div>Panel3</div>
        </Tab>
      </Tabs>
    );

    fireEvent.click(screen.queryAllByTestId('tabs__header')[1]);
    expect(onTabChange).toHaveBeenCalled();
    expect(onTabChange).toHaveBeenCalledWith(1);
  });
  test('should show correct active tab with content', () => {
    render(
      <Tabs activeTab={2}>
        <Tab header="Header1">
          <div>Panel1</div>
        </Tab>
        <Tab header="Header2">
          <div>Panel2</div>
        </Tab>
        <Tab header="Header3">
          <div>Panel3</div>
        </Tab>
      </Tabs>
    );
    expect(screen.queryAllByTestId('tabs__header')[2]).toHaveClass(
      '!border-secondary pb-1 !text-primary'
    );
    expect(screen.getByTestId('tabs__panel').textContent).toEqual('Panel3');
  });
});

import { render, screen } from '@testing-library/react';
import { Accordion, AccordionPanel } from './Accordion';

describe('Accordion', () => {
  test('should render all accordion correctly when input 1 panels', async () => {
    render(
      <Accordion>
        <AccordionPanel header="Header1">
          <div>Panel1</div>
        </AccordionPanel>
      </Accordion>
    );
    expect(screen.queryAllByTestId('accordion__header').length).toBe(1);
    expect(screen.queryAllByTestId('accordion__panel').length).toBe(1);
    expect(screen.queryAllByTestId('accordion__header')[0].textContent).toEqual(
      'Header1'
    );
    expect(screen.queryAllByTestId('accordion__panel')[0].textContent).toEqual(
      'Panel1'
    );
  });
  test('should render all accordion correctly when input 2 panels', async () => {
    render(
      <Accordion>
        <AccordionPanel header="Header1">
          <div>Panel1</div>
        </AccordionPanel>
        <AccordionPanel header="Header2">
          <div>Panel2</div>
        </AccordionPanel>
      </Accordion>
    );
    expect(screen.queryAllByTestId('accordion__header').length).toBe(2);
    expect(screen.queryAllByTestId('accordion__panel').length).toBe(2);
    expect(screen.queryAllByTestId('accordion__header')[0].textContent).toEqual(
      'Header1'
    );
    expect(screen.queryAllByTestId('accordion__header')[1].textContent).toEqual(
      'Header2'
    );
    expect(screen.queryAllByTestId('accordion__panel')[0].textContent).toEqual(
      'Panel1'
    );
    expect(screen.queryAllByTestId('accordion__panel')[1].textContent).toEqual(
      'Panel2'
    );
  });
});

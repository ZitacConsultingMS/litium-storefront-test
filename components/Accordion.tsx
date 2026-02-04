'use client';
import clsx from 'clsx';
import React, { Fragment, ReactElement, useMemo, useState } from 'react';
import { Text } from './elements/Text';
import CaretDown from './icons/caret-down';

/**
 * An Accordion Panel.
 * @param header Title of the section.
 * @param children Section content.
 * @returns
 */
export const AccordionPanel = ({
  children,
}: {
  header: string;
  children: React.ReactElement;
}) => children;

/**
 * Groups a collection of contents in expandable sections.
 * Accordion consists of one or more AccordionPanel components. Title of the section
 * is defined using header attribute.
 * ```
 * <Accordion>
      <AccordionPanel header="Header 1">
        <div>Content 1</div>
      </AccordionPanel>
      <AccordionPanel header="Header 2">
        <div>Content 2</div>
      </AccordionPanel>
    </Accordion>
 * ```
 * @param children a collection of AccordionPanel.
 * @returns
 */
export const Accordion = ({
  children,
  classCssHeader,
  classCssIcon,
  classCssContent,
  className,
}: {
  classCssHeader?: string;
  classCssIcon?: string;
  classCssContent?: string;
  className?: string;
  children: React.ReactElement | React.ReactElement[];
}) => {
  const accordions = useMemo(() => {
    const tmp: React.ReactElement[] = [];
    React.Children.forEach(children, (child: any) => {
      tmp.push(child);
    });
    return tmp;
  }, [children]);

  const content = accordions.map((accordion: any, indexItem: number) => (
    <Panel
      key={`${accordion?.props.header} - ${indexItem}`}
      header={accordion?.props.header}
      expanded={indexItem === 0}
      classCssHeader={classCssHeader}
      classCssIcon={classCssIcon}
      classCssContent={classCssContent}
      index={indexItem}
    >
      {accordion.props.children}
    </Panel>
  ));

  return (
    <nav className={clsx('p-0 lg:pr-4', className)} aria-label="Accordion">
      {content}
    </nav>
  );
};

const Panel = (props: {
  expanded: boolean;
  header: string;
  children: ReactElement;
  classCssHeader?: string;
  classCssIcon?: string;
  classCssContent?: string;
  index?: number;
}) => {
  const [expanded, setExpanded] = useState(props.expanded);
  const panelId = `accordion-panel-${props.index}`;
  const headerId = `accordion-header-${props.index}`;

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setExpanded(!expanded);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setExpanded(false);
    }
  };

  return (
    <Fragment>
      <div
        id={headerId}
        className={clsx(
          'flex cursor-pointer items-center justify-between text-ellipsis whitespace-nowrap border-tertiary py-5 first:border-t',
          props.classCssHeader
        )}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={onKeyDown}
        role="button"
        tabIndex={0}
        aria-controls={panelId}
        aria-expanded={expanded}
      >
        <Text data-testid="accordion__header" className="text-h4 font-bold">
          {props.header || ''}
        </Text>
        {!expanded && (
          <CaretDown className={clsx('mr-4 h-4 w-4', props.classCssIcon)} />
        )}
        {expanded && (
          <CaretDown
            className={clsx('mr-4 h-4 w-4 rotate-180', props.classCssIcon)}
          />
        )}
      </div>
      <div
        id={panelId}
        aria-labelledby={headerId}
        role="region"
        className={clsx(
          'border-b border-tertiary pb-8 pt-1 transition-all duration-200',
          !expanded && 'focus-locked max-h-0 overflow-hidden !py-0',
          expanded && 'max-h-max',
          props.classCssContent
        )}
        data-testid="accordion__panel"
      >
        {props.children}
      </div>
    </Fragment>
  );
};

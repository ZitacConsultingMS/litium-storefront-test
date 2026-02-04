'use client';
import clsx from 'clsx';
import { useTranslations } from 'hooks/useTranslations';
import { ChevronDown } from 'lucide-react';
import React, { Fragment, ReactElement, useMemo, useState } from 'react';
import { Text } from './elements/Text';

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
  id,
}: {
  classCssHeader?: string;
  classCssIcon?: string;
  classCssContent?: string;
  className?: string;
  children: React.ReactElement | React.ReactElement[];
  id?: string;
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
      id={id}
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
  id?: string;
}) => {
  const t = useTranslations();
  const [expanded, setExpanded] = useState(props.expanded);
  const panelId = `${props.id || 'accordion'}-panel-${props.index}`;
  const headerId = `${props.id || 'accordion'}-header-${props.index}`;

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
        aria-controls={expanded ? panelId : undefined}
        aria-expanded={expanded}
        aria-label={`${t('commons.open')} ${props.header}`}
        data-testid="accordion__header-button"
      >
        <Text data-testid="accordion__header" className="text-h4 font-bold">
          {props.header || ''}
        </Text>
        {!expanded && (
          <ChevronDown
            className={clsx('mr-4 h-7 w-7 text-[#333]', props.classCssIcon)}
          />
        )}
        {expanded && (
          <ChevronDown
            className={clsx(
              'mr-4 h-7 w-7 rotate-180 text-[#333]',
              props.classCssIcon
            )}
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

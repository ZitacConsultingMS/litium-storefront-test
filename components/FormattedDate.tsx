'use client';
import { WebsiteContext } from 'contexts/websiteContext';
import { useContext } from 'react';
import FormattedDateServerComponent from './FormattedDate.server';

/**
 * Represents a component to display a formatted date based on the input datetime.
 * @param date an input datetime value to format.
 * @param className optional custom css class name.
 * @returns
 */
function FormattedDate({
  date,
  className = '',
  ...props
}: {
  date: Date;
  className?: string;
}) {
  const websiteContext = useContext(WebsiteContext);
  return (
    <FormattedDateServerComponent
      date={date}
      className={className}
      culture={websiteContext.culture.code}
      {...props}
    />
  );
}

export default FormattedDate;

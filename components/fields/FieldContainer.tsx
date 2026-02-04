import StringValue from 'components/fields/StringValue';
import TextOptionFieldValues from 'components/fields/TextOptionFieldValues';
import { Field } from 'models/field';
import React from 'react';
import BooleanValue from './BooleanValue';
import DecimalOptionFieldValues from './DecimalOptionFieldValues';
import DecimalValue from './DecimalValue';
import IntOptionFieldValues from './IntOptionFieldValues';
import IntValue from './IntValue';

interface FieldContainerProps {
  /**
   * List of fields in the container.
   */
  fields: Field[];
  control: any;
}

/**
 * Represents a component to render a Field Container.
 * The component loops through the field list, looks up a field template
 * based on its `__typename` and uses it to render the fields.
 * @param props a FieldContainerProps input param.
 * @returns
 */

function FieldContainer(props: FieldContainerProps) {
  return props.fields && props.fields.length > 0 ? (
    <>
      {props.fields.map((field) => {
        if (!field.fieldMetadata.readable && !field.fieldMetadata.writable) {
          return null;
        }

        const FieldComponent = getComponent(field.__typename);
        if (!FieldComponent) {
          return null;
        }
        return (
          <FieldComponent
            key={`${field.id}-${field.__typename}`}
            value={field}
            control={props.control}
          ></FieldComponent>
        );
      })}
    </>
  ) : (
    <></>
  );
}

/**
 * getComponent retrieves a component from the Components map based on the provided typename.
 * @param typename - The typename of the field.
 * @returns a field component.
 */
function getComponent(
  typename: string
): (props: any) => React.JSX.Element | Promise<React.JSX.Element> {
  return Components[typename];
}

// Components is a map of typenames to their corresponding field components.
// To register a new component, add an entry to this map with the typename as the key
// and the component as the value.
const Components: {
  [typename: string]: (
    props: any
  ) => React.JSX.Element | Promise<React.JSX.Element>;
} = {
  StringValue,
  TextOptionFieldValues,
  IntValue,
  IntOptionFieldValues,
  DecimalValue,
  DecimalOptionFieldValues,
  BooleanValue,
};

export default FieldContainer;

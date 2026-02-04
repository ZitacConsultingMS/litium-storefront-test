import { gql } from '@apollo/client';

export const FIELD_VALUES_FRAGMENT = gql`
  fragment FieldValues on IFieldValueItem {
    id
    field
    name
    ... on StringValue {
      stringValue
    }
    ... on BooleanValue {
      booleanValue
    }
    ... on DateTimeValue {
      dateTimeValue
    }
    ... on DecimalValue {
      decimalValue
    }
    ... on IntValue {
      intValue
    }
    ... on IntOptionFieldValues {
      intOptionFieldValues {
        name
        value
      }
    }
    ... on DecimalOptionFieldValues {
      decimalOptionFieldValues {
        name
        value
      }
    }
    ... on TextOptionFieldValues {
      textOptionFieldValues {
        name
        value
      }
    }
    ... on LinkFieldValue {
      linkFieldValue {
        url
        text
      }
    }
    ... on LongValue {
      longValue
    }
    ... on PointerMediaImageValue {
      pointerMediaImageValue {
        item {
          ...Image
          filename
        }
      }
    }
    ... on PointerMediaFileValue {
      pointerMediaFileValue {
        item {
          url
          alt
          filename
        }
      }
    }
  }
`;

export const FIELD_METADATA_FRAGMENT = gql`
  fragment FieldMetadatas on IFieldMetadataItem {
    inputModel
    inputField
    fieldType
    readable
    writable
    ... on FieldTypeMetadataDecimalOption {
      decimalOptions {
        multiSelect
        items {
          value
          name
        }
      }
    }
    ... on FieldTypeMetadataIntOption {
      intOptions {
        multiSelect
        items {
          value
          name
        }
      }
    }
    ... on FieldTypeMetadataTextOption {
      textOptions {
        multiSelect
        items {
          value
          name
        }
      }
    }
  }
`;

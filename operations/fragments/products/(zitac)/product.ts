import { gql } from '@apollo/client';

export const PRODUCT_FRAGMENT = gql`
  fragment Product on IProductItem {
    articleNumber
    id
    name
    description
    stockStatus {
      inStockQuantity
    }
    thumbnailImages: images(max: { height: 200, width: 200 }) {
      ...Image
    }
    largeImages: images(max: { height: 1200, width: 840 }) {
      ...Image
    }
    price {
      unitPriceIncludingVat
      unitPriceExcludingVat
      discountPriceIncludingVat
      discountPriceExcludingVat
    }
    ... on AllAttributesInListProduct {
      url
      fields {
        bullets
        description
        technicalSpecifications
      }
      rawData {
        variants {
            articleNumber
            name
            description
            url
        }
      }
      fieldGroups(filter: { id: { value: "Artikelmedaljer", operator: "eq" } }) {
        fieldGroupId
        name
        fields {
          name
          ... on ProductTagsProductFieldValues {
            productTagsProductFieldValues {
              productTagsTag {
                name
                value
              }
              productTagsFromDate
              productTagsToDate
            }
          }
        }
      }
      helloRetailFieldGroup: fieldGroups(filter: { id: { value: "HelloRetail", operator: "eq" } }) {
        fields {
          name
          id
          field
          ... on StringValue {
            stringValue
          }
          ... on ZsHelloRetailRecomHorizontalProductFieldValues {
            zsHelloRetailRecomHorizontalProductFieldValues {
              zsHelloRetailRecomBoxIdProductTitle
              zsHelloRetailRecomBoxIdProduct
            }
          }
        }
      }
      allFieldGroups: fieldGroups {
        fieldGroupId
        name
        fields {
          ...FieldValues
        }
      }
      variants {
          nodes {
            images(max: { height: 80, width: 56 }) {
              filename
              url
              alt
            }
            name
            articleNumber
            stockStatus {
              inStockQuantity
            }
            url
            price {
              unitPriceIncludingVat
              unitPriceExcludingVat
              discountPriceIncludingVat
              discountPriceExcludingVat
            }
            displayFieldGroups {
              fieldGroupId
              fields {
                ...FieldValues
              }
            }
          }
        }

    }
  }
`;

// när någon användbar fieldtemplate är på plats, ta bort filter eftersom det endast skall finnas en, annars hur skall det matchas mot product?
// displayFieldGroups {
//(filter: { id: { value: "coloritems", operator: "eq" } })
//   fieldGroupId
//   fields { …FieldValues }
// }

//för hantering av displayFieldGroups, flera grupper, tex tools, coloritems, sizeitems

// export const PRODUCT_FRAGMENT = gql`
//   fragment Product on IProductItem {
//     articleNumber
//     id
//     name
//     description
//     stockStatus { inStockQuantity }

//     thumbnailImages: images(max: { height: 200, width: 200 }) { ...Image }
//     largeImages: images(max: { height: 1200, width: 840 }) { ...Image }

//     price {
//       unitPriceIncludingVat
//       discountPriceIncludingVat
//     }

//     ... on AllAttributesInListProduct {
//       url
//       fields { bullets description }

//       rawData {
//         variants { articleNumber name description url }
//       }

//       fieldGroups(filter: { id: { value: "Artikelmedaljer", operator: "eq" } }) {
//         fieldGroupId
//         name
//         fields {
//           name
//           ... on ProductTagsProductFieldValues {
//             productTagsProductFieldValues {
//               productTagsTag { name value }
//               productTagsFromDate
//               productTagsToDate
//             }
//           }
//         }
//       }

//       variants {
//         nodes {
//           images(max: { height: 80, width: 56 }) { filename url alt }
//           articleNumber
//           stockStatus { inStockQuantity }
//           url
//           price { unitPriceIncludingVat }

//           toolsGroup: displayFieldGroups(
//             filter: { id: { value: "tools", operator: "eq" } }
//           ) {
//             fieldGroupId
//             fields { ...FieldValues }
//           }

//           coloritemsGroup: displayFieldGroups(
//             filter: { id: { value: "coloritems", operator: "eq" } }
//           ) {
//             fieldGroupId
//             fields { ...FieldValues }
//           }

//           sizeitemsGroup: displayFieldGroups(
//             filter: { id: { value: "sizeitems", operator: "eq" } }
//           ) {
//             fieldGroupId
//             fields { ...FieldValues }
//           }
//         }
//       }
//     }
//   }
// `;

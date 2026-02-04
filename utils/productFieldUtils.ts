/**
 * Gets description_short from fieldGroups
 * @param fieldGroups Array of field groups to search through
 * @param allFieldGroups Optional additional field groups (from GraphQL query alias)
 * @returns description_short value if found, otherwise null
 */
export function getDescriptionShort(
  fieldGroups?: any[],
  allFieldGroups?: any[]
): string | null {
  const groupsToCheck = [...(fieldGroups || []), ...(allFieldGroups || [])];

  if (groupsToCheck.length === 0) return null;

  for (const group of groupsToCheck) {
    if (!group.fields) continue;

    for (const field of group.fields) {
      // Check if this field is description_short by field id or name
      if (
        (field.field === 'description_short' ||
          field.name === 'description_short') &&
        field.stringValue &&
        field.stringValue.trim()
      ) {
        return field.stringValue.trim();
      }
    }
  }

  return null;
}

/**
 * Gets the display name for a product (description_short if available, otherwise name)
 * @param name Product name
 * @param fieldGroups Array of field groups to search through
 * @param allFieldGroups Optional additional field groups (from GraphQL query alias)
 * @returns Display name (description_short || name)
 */
export function getProductDisplayName(
  name: string | null | undefined,
  fieldGroups?: any[],
  allFieldGroups?: any[]
): string {
  const descriptionShort = getDescriptionShort(fieldGroups, allFieldGroups);
  return descriptionShort || name || '';
}

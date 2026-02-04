const lineBreak = '\r\n';

exports.service = function (types) {
  return `
${types
  .map((type) => {
    return `import ${type} from 'components/blocks/${type}';`;
  })
  .join(lineBreak)}

/**
 * Gets a Block component by its type.
 * @param typename Component's type name, for example: BannerBlock.
 * @returns a Block component.
 */
export function getComponent(
  typename: string
): (props: any) => React.JSX.Element | Promise<React.JSX.Element> {
  return Components[typename];
}

const Components: {
  [typename: string]: (props: any) => React.JSX.Element | Promise<React.JSX.Element>;
} = {
  ${types
    .map((type) => {
      return `${type},`;
    })
    .join(`${lineBreak}  `)}
};
`;
};

exports.component = function (name) {
  return `
function ${name}() {
  return <div>${name}</div>;
}

export default ${name};
`;
};

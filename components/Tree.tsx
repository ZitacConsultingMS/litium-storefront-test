'use client';

import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import clsx from 'clsx';
import Link from 'components/Link';
import { ChevronDown } from 'lucide-react';
import { PageItem } from 'models/page';

/**
 *
 * @param data a list of TreeNode to render.
 * @param activeUrl current active Url to make it bold in the Tree.
 * @param defaultExpanded expanded node ids.
 * @returns
 */
function TreeComponent({
  data,
  activeUrl,
  defaultExpanded,
}: {
  data: PageItem[];
  activeUrl: string;
  defaultExpanded?: string[];
}) {
  const renderTree = (treeItems: PageItem[], initIndex?: number) => {
    return treeItems.map((item: any) => {
      let index = initIndex ?? 1;
      let children = undefined;
      if (item.children && item.children.nodes.length > 0) {
        index++;
        children = renderTree(item.children.nodes, index);
      }
      return (
        <TreeItem
          sx={{
            [`& .${treeItemClasses.content}`]: {
              padding: '4px 20px 4px 3px',
              borderRadius: '5px',
              [`& .${treeItemClasses.label}`]: {
                paddingLeft: 0,
                minHeight: '24px',
                overflow: 'initial',
                '& > a': {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minHeight: '24px',
                },
              },
              '&:hover, &[data-focused]': {
                backgroundColor: '#0000000a !important',
              },
              '&[data-selected]': {
                backgroundColor: 'transparent',
              },
              [`& .${treeItemClasses.iconContainer}`]: {
                marginLeft: '8px',
              },
            },
            [`& .${treeItemClasses.groupTransition}`]: {
              marginLeft: 0,
              [`& .${treeItemClasses.content}`]: {
                paddingLeft: index === 3 ? '34px' : '17px',
              },
            },
          }}
          key={item.url}
          itemId={item.url}
          data-testid="tree-item"
          label={
            <Link
              className={clsx(
                'block text-sm',
                item.url === activeUrl ? 'font-bold' : 'font-normal'
              )}
              href={item.url || ''}
              data-testid="tree-item__link"
            >
              {item.name}
            </Link>
          }
        >
          {children}
        </TreeItem>
      );
    });
  };
  return (
    <SimpleTreeView
      aria-label="file system navigator"
      slots={{
        collapseIcon: () => (
          <ChevronDown className="mr-2 h-5 w-5 flex-shrink-0 text-secondary-2" />
        ),
        expandIcon: () => (
          <ChevronDown className="mr-2 h-5 w-5 flex-shrink-0 -rotate-90 text-secondary-2" />
        ),
      }}
      defaultExpandedItems={defaultExpanded}
      sx={{
        flexGrow: 1,
      }}
      multiSelect={false}
    >
      {renderTree(data)}
    </SimpleTreeView>
  );
}

export default TreeComponent;

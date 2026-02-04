'use client';
import { gql } from '@apollo/client';
import Link from 'components/Link';
import { Block } from 'models/block';
import { ContentFieldType } from 'models/content';
import { LinkFieldDefinition } from 'models/navigation';
import { useEffect, useState } from 'react';
import { queryClient } from 'services/dataService.client';

interface ZsTopMenuType {
  navigationLink: LinkFieldDefinition;
}

interface ZsTopMenuField extends ContentFieldType {
  zsLinks: ZsTopMenuType[];
}

interface ZsTopMenuBlockProps extends Block {
  fields: ZsTopMenuField;
}

export default function ZsTopMenuBlock(props: ZsTopMenuBlockProps) {
  let [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await queryClient({
          query: GET_CURRENT_USER,
        });
        if (currentUser?.me?.person) {
          setIsLogged(true);
        }
      } catch {
        setIsLogged(false);
      }
    };
    fetchUser();
  });

  const links = props.fields.zsLinks;
  return (
    <div className="relative h-auto">
      {isLogged && (
        <ul className="list-none py-2 text-center">
          {links.map(
            (link, index) =>
              link.navigationLink &&
              link.navigationLink.url && (
                <li className="mx-4 inline-block text-sm" key={index}>
                  <Link
                    href={link.navigationLink.url}
                    className="hover:opacity-80"
                  >
                    {link.navigationLink.text}
                  </Link>
                </li>
              )
          )}
        </ul>
      )}
    </div>
  );
}

const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      person {
        id
      }
    }
  }
`;

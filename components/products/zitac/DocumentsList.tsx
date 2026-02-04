'use client';
import Link from 'components/Link';
import { Text } from 'components/elements/Text';
import Document from 'components/icons/zitac/document';
import { isDocumentFile } from 'utils/imageUtils';

interface DocumentFile {
  url?: string;
  filename?: string;
  alt?: string;
}

interface DocumentsListProps {
  documents: DocumentFile[];
}

/**
 * Renders a list of document files with links that open in a new tab
 * @param documents - Array of document file objects
 */
export default function DocumentsList({ documents }: DocumentsListProps) {
  const validDocuments = documents.filter(
    (doc) => doc.url && isDocumentFile(doc.url)
  );

  if (validDocuments.length === 0) {
    return null;
  }

  return (
    <div className="documents-list">
      <ul className="list-none space-y-3 p-0">
        {validDocuments.map((document, index) => (
          <li key={`${document.filename}-${index}`} className="document-item">
            <Link
              href={document.url!}
              target="_blank"
              rel="noopener noreferrer"
              title={document.alt || document.filename}
              className="af:text-af-bluegreen flex items-center gap-2 text-seasea-blue hover:underline"
              data-testid="product-detail__document-link"
            >
              <Document />
              <Text className="text-sm">{document.filename || 'Document'}</Text>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

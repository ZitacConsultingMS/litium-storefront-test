import Link from 'components/Link';
import { User } from 'lucide-react';

function Profile({ myPagesPageUrl }: { myPagesPageUrl: string }) {
  return (
    <Link
      href={myPagesPageUrl}
      className="hidden lg:flex"
      aria-label="My Pages"
    >
      <User />
    </Link>
  );
}

export default Profile;

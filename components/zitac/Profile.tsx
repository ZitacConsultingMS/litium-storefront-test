import Link from 'components/Link';
import User from './../icons/zitac/user';

function Profile({ myPagesPageUrl }: { myPagesPageUrl: string }) {
  return (
    <Link href={myPagesPageUrl} className="lg:flex" aria-label="My Pages">
      <User />
    </Link>
  );
}

export default Profile;

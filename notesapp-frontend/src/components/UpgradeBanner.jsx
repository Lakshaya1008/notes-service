/**
 * UpgradeBanner - Informational banner shown when note limit is reached
 *
 * This is an INFO-ONLY component. There is NO upgrade action button.
 * Tenant upgrade is a backend-only operation not exposed to the frontend.
 */
const UpgradeBanner = ({ message }) => {
  return (
    <div className="upgrade-banner">
      <p className="upgrade-banner-text">
        {message || 'You have reached the note limit for the FREE plan. Contact your administrator to upgrade to PRO for unlimited notes.'}
      </p>
    </div>
  );
};

export default UpgradeBanner;

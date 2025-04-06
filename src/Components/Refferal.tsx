import { useAuth } from "../Hooks/useAuth";
import AddReferralCode from "./AddReferralCode";
import ReferralDetails from "./ReferralDetalis";

const Referral = () => {
  const { user } = useAuth();

  return (
    <div >
      {user?.referralCode && user?.referralCode?.length > 0 ? (
        <ReferralDetails />
      ) : (
        <AddReferralCode />
      )}
    </div>
  );
};

export default Referral;

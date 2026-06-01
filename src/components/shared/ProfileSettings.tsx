import { ProfileCard, PasswordCard } from "./ProfileSettingsParts";

interface User {
  full_name?: string;
  email?: string;
  phone?: string;
  profile_picture?: string | null;
}

interface ProfileSettingsProps {
  userRole?: string;
  user?: User;
}

export const ProfileSettings = ({
  userRole = "User",
  user,
}: ProfileSettingsProps) => {
  return (
    <div className="space-y-6">
      <ProfileCard userRole={userRole} user={user} />
      <PasswordCard user={user} />
    </div>
  );
};

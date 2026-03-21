import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Eye, EyeOff, Camera, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export const ProfileSettings = ({ userRole = 'User', user }) => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    profile_picture: null,
  });

  const fileInputRef = useRef(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Convex mutations
  const updateProfileMutation = useMutation(api.users.mutations.updateProfile);
  const changePasswordMutation = useMutation(api.auth.mutations.changePassword);
  const uploadProfilePictureMutation = useMutation(api.auth.mutations.uploadProfilePicture);
  const deleteProfilePictureMutation = useMutation(api.auth.mutations.deleteProfilePicture);

  // Initialize profile data from user prop
  React.useEffect(() => {
    if (user) {
      setProfileData({
        name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        profile_picture: user.profile_picture || null,
      });
    }
  }, [user]);

  React.useEffect(() => {
    if (user) {
      setProfileData({
        name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        profile_picture: user.profile_picture || null,
      });
    }
  }, [user]);

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, WEBP)');
      return;
    }

    // Check file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploadingPhoto(true);

    try {
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result;
        const response = await uploadProfilePictureMutation({ fileData: base64 });
        if (response.message && response.message.includes('Clerk')) {
          toast.success('Profile pictures are managed by Clerk. Use your Clerk account settings.');
        } else {
          toast.success('Profile picture updated successfully!');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploadingPhoto(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async () => {
    if (!profileData.profile_picture) return;

    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    setIsDeletingPhoto(true);

    try {
      const response = await deleteProfilePictureMutation();
      if (response.message && response.message.includes('Clerk')) {
        toast.success('Profile pictures are managed by Clerk. Use your Clerk account settings to delete.');
        setProfileData(prev => ({ ...prev, profile_picture: null }));
      } else {
        toast.success('Profile picture deleted successfully!');
        setProfileData(prev => ({ ...prev, profile_picture: null }));
      }
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      toast.error('Failed to delete profile picture');
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const response = await updateProfileMutation({ full_name: profileData.name });
      if (response.success) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await changePasswordMutation({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (response.success || response.message) {
        toast.success('Password management is handled by Clerk. Use your account settings to change password.');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details and contact information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className='space-y-6'>
            <div className='flex items-center gap-6'>
              <div className='relative'>
                <Avatar className='h-24 w-24'>
                  {profileData.profile_picture ? (
                    <AvatarImage src={profileData.profile_picture.startsWith('http') ? profileData.profile_picture : profileData.profile_picture} alt={profileData.name} />
                  ) : null}
                  <AvatarFallback className='bg-primary/10 text-primary text-2xl'>
                    <User className='h-12 w-12' />
                  </AvatarFallback>
                </Avatar>

                {isUploadingPhoto || isDeletingPhoto ? (
                  <div className='absolute bottom-0 right-0 p-2 bg-muted text-muted-foreground rounded-full border border-border shadow-sm'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                  </div>
                ) : (
                  <div className='absolute bottom-0 right-0 flex space-x-1'>
                    {profileData.profile_picture && (
                      <button
                        type='button'
                        className='p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors border border-background'
                        onClick={handleDeletePhoto}
                        title="Remove photo"
                      >
                        <Trash2 className='h-3 w-3' />
                      </button>
                    )}
                    <button
                      type='button'
                      className='p-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors border border-background'
                      onClick={handlePhotoClick}
                      title="Upload photo"
                    >
                      <Camera className='h-3.5 w-3.5' />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handlePhotoChange}
                />
              </div>
              <div>
                <p className='font-medium text-lg'>{profileData.name}</p>
                <p className='text-sm text-muted-foreground capitalize'>{userRole}</p>
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Full Name</Label>
                <Input
                  id='name'
                  name='name'
                  value={profileData.name}
                  onChange={handleProfileChange}
                  disabled={true}
                  placeholder='Enter your full name'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email Address</Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  value={profileData.email}
                  onChange={handleProfileChange}
                  disabled={true}
                  placeholder='your.email@example.com'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone Number</Label>
                <Input
                  id='phone'
                  name='phone'
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  disabled={true}
                  placeholder='+251 91 234 5678'
                />
              </div>
            </div>

            <div className='p-3 bg-blue-50 border border-blue-200 rounded-md'>
              <p className='text-sm text-blue-700'>
                Profile editing is currently restricted. Please contact your system administrator to update your personal information.
              </p>
            </div>

            <div className='flex justify-end'>
              <Button type='submit' disabled={true}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='currentPassword'>Current Password</Label>
              <div className='relative'>
                <Input
                  id='currentPassword'
                  name='currentPassword'
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder='Enter current password'
                />
                <button
                  type='button'
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  {showCurrentPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='newPassword'>New Password</Label>
                <div className='relative'>
                  <Input
                    id='newPassword'
                    name='newPassword'
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder='Enter new password'
                  />
                  <button
                    type='button'
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                  >
                    {showNewPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                  </button>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='confirmPassword'>Confirm New Password</Label>
                <div className='relative'>
                  <Input
                    id='confirmPassword'
                    name='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder='Confirm new password'
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                  >
                    {showConfirmPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className='text-xs text-muted-foreground'>
              Password must be at least 8 characters long.
            </p>

            <div className='flex justify-end'>
              <Button type='submit' disabled={isChangingPassword}>
                {isChangingPassword ? 'Changing Password...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

import React, { useState } from 'react';
import ToggleSwitch from './ToggleSwitch';

const SettingsTab = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive email updates about your tasks</p>
            </div>
            <ToggleSwitch checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Push Notifications</h4>
              <p className="text-sm text-gray-600">Receive push notifications on your device</p>
            </div>
            <ToggleSwitch checked={pushNotifications} onChange={() => setPushNotifications(!pushNotifications)} />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">SMS Notifications</h4>
              <p className="text-sm text-gray-600">Receive SMS updates about your tasks</p>
            </div>
            <ToggleSwitch checked={smsNotifications} onChange={() => setSmsNotifications(!smsNotifications)} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Profile Visibility</h4>
              <p className="text-sm text-gray-600">Allow service providers to see your profile</p>
            </div>
            <ToggleSwitch checked={profileVisibility} onChange={() => setProfileVisibility(!profileVisibility)} />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Location Sharing</h4>
              <p className="text-sm text-gray-600">Share your location with service providers</p>
            </div>
            <ToggleSwitch checked={locationSharing} onChange={() => setLocationSharing(!locationSharing)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab; 
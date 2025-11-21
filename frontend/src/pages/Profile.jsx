import React from 'react';

const Profile = () => {
  return (
    <div className="page-container">
      <div className="section-container">
        <div className="card">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>
          <p className="text-gray-600 mb-6">Manage your account information and preferences.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    className="input-field"
                    rows="3"
                    placeholder="Enter your address"
                  ></textarea>
                </div>
                
                <button type="submit" className="btn-primary">
                  Update Profile
                </button>
              </form>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Settings</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Change Password</h3>
                  <button className="btn-outline text-sm">Update Password</button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Profile Picture</h3>
                  <button className="btn-outline text-sm">Upload Photo</button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Account Status</h3>
                  <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

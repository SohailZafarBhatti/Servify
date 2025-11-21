import React from 'react';
import withAuthProtection from '../hoc/withAuthProtection';

/**
 * Example component that demonstrates how to use the withAuthProtection HOC
 * This component will only be accessible to authenticated users
 * and will show a loading spinner during initial render
 */
const ProtectedComponent = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Protected Component</h1>
      <p className="mb-4">
        This component is protected by the <code>withAuthProtection</code> HOC.
        It will only be accessible to authenticated users and will show a loading
        spinner during initial render.
      </p>
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">How to use withAuthProtection</h2>
        <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
          {`import withAuthProtection from '../hoc/withAuthProtection';

const YourComponent = () => {
  // Your component code
};

// Wrap with withAuthProtection
export default withAuthProtection(YourComponent, {
  delay: 500, // Optional: delay before showing component
  loadingMessage: 'Loading...' // Optional: custom loading message
});`}
        </pre>
      </div>
    </div>
  );
};

// Export the component wrapped with withAuthProtection
export default withAuthProtection(ProtectedComponent, {
  delay: 500,
  loadingMessage: 'Loading protected content...'
});
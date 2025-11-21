# Higher-Order Components (HOCs)

This directory contains reusable Higher-Order Components (HOCs) that can be used to enhance React components with additional functionality.

## Available HOCs

### withLoading

Adds loading functionality to a component, displaying a loading spinner for a specified delay.

```jsx
import withLoading from '../hoc/withLoading';

const YourComponent = () => {
  // Your component code
};

export default withLoading(YourComponent, {
  delay: 500, // Optional: delay in milliseconds before showing component
  loadingMessage: 'Loading...' // Optional: custom loading message
});
```

### withAuthProtection

Combines authentication protection with loading functionality. Components wrapped with this HOC will:

1. Only be accessible to authenticated users
2. Redirect to the login page if the user is not authenticated
3. Show a loading spinner during the initial render

```jsx
import withAuthProtection from '../hoc/withAuthProtection';

const YourComponent = () => {
  // Your component code
};

export default withAuthProtection(YourComponent, {
  delay: 500, // Optional: delay before showing component
  loadingMessage: 'Loading...' // Optional: custom loading message
});
```

## Example Usage

See the example component at `/examples/ProtectedComponent.jsx` for a demonstration of how to use the `withAuthProtection` HOC.

You can view this example by navigating to `/protected-example` in the application.

## Best Practices

- Use `withLoading` for components that need to show a loading state during initial render or data fetching
- Use `withAuthProtection` for components that should only be accessible to authenticated users
- Consider composition of HOCs when multiple behaviors are needed
- Keep the HOC chain as short as possible to avoid unnecessary re-renders
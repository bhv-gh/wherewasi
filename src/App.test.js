import { render, screen } from '@testing-library/react';
import AuthGate from './components/AuthGate';

// App pulls in the Supabase client at import time, so the smoke test targets
// the first screen the user sees instead.
test('renders the auth gate on first run', () => {
  render(<AuthGate onReady={() => {}} />);
  expect(screen.getByText(/Where Was I/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/secret passphrase/i)).toBeInTheDocument();
});

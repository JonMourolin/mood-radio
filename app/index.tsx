import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect the user to the default tab (e.g., /radio)
  return <Redirect href="/radio" />;
}

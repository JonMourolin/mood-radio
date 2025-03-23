import { Redirect } from 'expo-router';

export default function Index() {
  // Rediriger vers Long Mixs quand on ouvre l'application
  return <Redirect href="/(tabs)/longmixs" />;
} 
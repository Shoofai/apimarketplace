import { getSiteMode } from '@/lib/settings/site-mode';
import { LoginForm } from './LoginForm';

export default async function LoginPage() {
  const { mode } = await getSiteMode();
  return <LoginForm isPrelaunch={mode === 'prelaunch'} />;
}

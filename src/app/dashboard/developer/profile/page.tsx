import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code2, Zap, Share2, Activity, GitBranch } from 'lucide-react';

export const metadata = {
  title: 'Developer Profile | Dashboard',
};

export default async function DeveloperProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const admin = createAdminClient();
  const { data: stakeholder } = await admin
    .from('stakeholders')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  type DeveloperProfileRow = {
    id: string;
    developer_stage: string;
    preferred_language: string | null;
    preferred_framework: string | null;
    experience_level: string | null;
    github_username: string | null;
    referral_code: string | null;
    code_generations: number;
    total_api_calls: number;
    unique_apis_used: number;
    first_code_gen_at: string | null;
    first_api_call_at: string | null;
    referrals_made: number;
  };

  let profile: DeveloperProfileRow | null = null;

  if (stakeholder) {
    const { data } = await admin
      .from('developer_profiles')
      .select(
        'id, developer_stage, preferred_language, preferred_framework, experience_level, github_username, referral_code, code_generations, total_api_calls, unique_apis_used, first_code_gen_at, first_api_call_at, referrals_made'
      )
      .eq('stakeholder_id', stakeholder.id)
      .maybeSingle();
    profile = data as DeveloperProfileRow | null;
  }

  const stageLabels: Record<string, string> = {
    landed: 'Exploring',
    api_explored: 'API Explorer',
    code_generated: 'Code Wizard',
    signed_up: 'Signed Up',
    api_key_created: 'Key Holder',
    first_call_made: 'Activated',
    active_user: 'Active',
    power_user: 'Power User',
    churned: 'Inactive',
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://apimarketplace.pro';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Code2 className="h-6 w-6" />
            Developer Profile
          </h1>
          <p className="text-muted-foreground mt-1">Your developer funnel progress and preferences</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/developer/onboard">Update preferences</Link>
        </Button>
      </div>

      {!profile ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-muted-foreground">Developer profile not set up yet.</p>
            <Button asChild>
              <Link href="/dashboard/developer/onboard">Set up developer profile</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Stage + stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" />
                Funnel Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="text-sm">
                  {stageLabels[profile.developer_stage] ?? profile.developer_stage}
                </Badge>
                {profile.developer_stage === 'active_user' && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20">Active</Badge>
                )}
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Code generations</dt>
                  <dd className="font-semibold text-lg">{profile.code_generations}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Total API calls</dt>
                  <dd className="font-semibold text-lg">{Number(profile.total_api_calls).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">APIs used</dt>
                  <dd className="font-semibold text-lg">{profile.unique_apis_used}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Referrals</dt>
                  <dd className="font-semibold text-lg">{profile.referrals_made}</dd>
                </div>
              </dl>
              {profile.first_api_call_at && (
                <p className="text-xs text-muted-foreground">
                  First API call: {new Date(profile.first_api_call_at).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {profile.preferred_language && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language</span>
                  <Badge variant="outline">{profile.preferred_language}</Badge>
                </div>
              )}
              {profile.preferred_framework && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Framework</span>
                  <Badge variant="outline">{profile.preferred_framework}</Badge>
                </div>
              )}
              {profile.experience_level && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-medium capitalize">{profile.experience_level}</span>
                </div>
              )}
              {profile.github_username && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GitHub</span>
                  <a
                    href={`https://github.com/${profile.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary flex items-center gap-1 hover:underline"
                  >
                    <GitBranch className="h-3 w-3" />
                    @{profile.github_username}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referral */}
          {profile.referral_code && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Share2 className="h-4 w-4" />
                  Your Referral Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Share this link and earn $10 credit for every developer who signs up and makes their first API call.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono break-all">
                    {siteUrl}/signup?ref={profile.referral_code}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={undefined}
                    asChild
                  >
                    <a
                      href={`/dashboard/referrals`}
                    >
                      View referrals
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

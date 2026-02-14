-- Allow platform admins to UPDATE feature_flags (toggles)
CREATE POLICY "Platform admins can update feature flags"
ON public.feature_flags
FOR UPDATE
TO authenticated
USING (
  (SELECT is_platform_admin FROM public.users WHERE id = auth.uid()) = true
)
WITH CHECK (
  (SELECT is_platform_admin FROM public.users WHERE id = auth.uid()) = true
);

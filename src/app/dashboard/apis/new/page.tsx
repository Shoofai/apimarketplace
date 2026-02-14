import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Publish New API | Dashboard',
  description: 'Publish a new API to the marketplace',
};

export default function PublishNewAPIPage() {
  redirect('/dashboard/apis/publish');
}

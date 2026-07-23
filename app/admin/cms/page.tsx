import { redirect } from 'next/navigation';

export default function AdminCmsRedirectPage() {
  redirect('/admin/content');
}

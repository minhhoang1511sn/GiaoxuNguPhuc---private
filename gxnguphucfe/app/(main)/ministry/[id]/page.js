import MinistryDetail from '@/views/MinistryDetail/MinistryDetail';

export default async function MinistryDetailPage({ params }) {
  const { id } = await params;
  return <MinistryDetail id={id} />;
}

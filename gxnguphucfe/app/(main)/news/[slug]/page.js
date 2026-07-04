import NewsDetail from '@/views/NewsDetail/NewsDetail';

export default async function NewsDetailPage({ params }) {
  const { slug } = await params;
  return <NewsDetail slug={slug} />;
}

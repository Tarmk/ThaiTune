import ScoreDetailsClient from './ScoreDetailsClient'

interface PageProps {
  params: { id: string }
}

export default function ScoreDetailsPage({ params }: PageProps) {
  return <ScoreDetailsClient id={params.id} />
}
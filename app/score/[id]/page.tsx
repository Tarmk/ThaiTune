import { Suspense } from 'react'
import ScoreDetailsPage from './ScoreDetailsPage'

interface PageProps {
  params: { id: string }
}

export default function Page({ params }: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ScoreDetailsPage id={params.id} />
    </Suspense>
  )
}


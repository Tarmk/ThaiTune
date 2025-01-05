"use client"

import { Suspense, useEffect, useState } from 'react'
import ScoreDetailsPage from './ScoreDetailsPage'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function Page({ params }: PageProps) {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };

    fetchParams();
  }, [params]);

  if (id === null) {
    return <div>Loading...</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ScoreDetailsPage id={id} />
    </Suspense>
  )
}


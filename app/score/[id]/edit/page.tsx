import { Suspense } from 'react';
import EditScoreClient from './EditScoreClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditScorePage({ params }: PageProps) {
  // Params is already a resolved object in Next.js App Router
  const id = params.id;
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditScoreClient id={id} />
    </Suspense>
  );
}

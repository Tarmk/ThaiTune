import { Suspense } from 'react';
import EditScoreClient from './EditScoreClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditScorePage({ params }: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditScoreClient id={params.id} />
    </Suspense>
  );
}

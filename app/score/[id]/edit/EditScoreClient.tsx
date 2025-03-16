'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface ClientProps {
  id: string;
}

export default function EditScoreClient({ id }: ClientProps) {
  const [flatId, setFlatId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const embedRef = useRef<HTMLDivElement | null>(null);

  // ... rest of your component code ...
  return (
    <div>
      {/* Your JSX here */}
    </div>
  );
} 
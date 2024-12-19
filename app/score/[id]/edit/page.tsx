"use client";

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { usePathname, useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const CreateAnotherScorePage = ({ title }: { title: string }) => {
  const [user, setUser] = useState<any>(null);
  const [flatId, setFlatId] = useState<string | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<any>(null);
  const initializeRef = useRef(false);

  const pathSegments = pathname.split('/');
  const id = pathSegments[pathSegments.length - 2];

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    const fetchScore = async () => {
      try {
        const scoreDoc = await getDoc(doc(db, 'scores', id as string));
        console.log('Score id:', id);
        if (scoreDoc.exists()) {
          const scoreData = scoreDoc.data();
          if (scoreData && scoreData.flatid) {
            setFlatId(scoreData.flatid);
          } else {
            console.error('Score data or flatid is undefined');
          }
        } else {
          console.error('Score not found');
        }
      } catch (err: any) {
        console.error('Error fetching score:', err.message || err);
      }
    };

    fetchScore();

    return () => unsubscribe();
  }, [id]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    if (initializeRef.current || !flatId) return;
    initializeRef.current = true;

    const initializeEmbed = () => {
      if (containerRef.current && window.Flat && flatId) {
        embedRef.current = new window.Flat.Embed(containerRef.current, {
          score: flatId,
          embedParams: {
            mode: 'edit',
            appId: '675579130b7f5c8a374ac19a',
            branding: false,
            controlsPosition: 'top',
            themePrimary: '#800000'
          }
        });
        console.log('Embed ref set');
      }
    };

    const script = document.createElement('script');
    script.src = 'https://prod.flat-cdn.com/embed-js/v1.5.1/embed.min.js';
    script.async = true;
    script.onload = initializeEmbed;
    document.body.appendChild(script);
  }, [flatId]);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <nav className="flex space-x-6">
              <a href="/dashboard" className="text-[#333333] hover:text-[#800000] font-medium">My scores</a>
              <a href="/community" className="text-[#333333] hover:text-[#800000] font-medium">Community</a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={handleLogout} className="text-[#333333] hover:text-[#800000]">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-[#333333] mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">By {user?.displayName || 'Anonymous'}</p>

        <div className="bg-white rounded-lg shadow-md">
          <div ref={containerRef} style={{ height: '450px', width: '100%' }} />
        </div>
      </main>
    </div>
  );
};

export default CreateAnotherScorePage;

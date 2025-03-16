"use client";

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { usePathname, useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import router from 'next/router';

const CreateAnotherScorePage = () => {
  const [user, setUser] = useState<any>(null);
  const [flatId, setFlatId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<any>(null);
  const initializeRef = useRef(false);

  const pathSegments = pathname.split('/');
  const id = pathSegments[pathSegments.length - 2];

  const [exportCount, setExportCount] = useState(0);
  const exportInterval = 30000;

  const [sharingSetting, setSharingSetting] = useState<string>('private');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [firestoreModifiedTime, setFirestoreModifiedTime] = useState<string | null>(null);

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
          if (scoreData) {
            if (scoreData.flatid) setFlatId(scoreData.flatid);
            if (scoreData.title) setTitle(scoreData.title);
            if (scoreData.sharing) setSharingSetting(scoreData.sharing);
            if (scoreData.modified) {
              const modifiedDate = scoreData.modified.toDate();
              setFirestoreModifiedTime(
                `${modifiedDate.toLocaleDateString()} ${modifiedDate.toLocaleTimeString()}`
              );
            }
          } else {
            console.error('Score data is undefined');
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

  const handleManualSave = async () => {
    if (embedRef.current && flatId) {
      try {
        const buffer = await embedRef.current.getMusicXML({ compressed: true });
        
        const base64String = btoa(
          new Uint8Array(buffer)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        // Save to localStorage
        const saveData = {
          title,
          timestamp: new Date().toISOString(),
          content: base64String
        };

        const storageKey = `score_${title}_manual_${Date.now()}`;
        localStorage.setItem(storageKey, JSON.stringify(saveData));

        // Update versions list
        const versionsList = JSON.parse(localStorage.getItem(`score_${title}_versions`) || '[]');
        versionsList.push({
          version: `Manual Save ${versionsList.length + 1}`,
          timestamp: saveData.timestamp,
          storageKey
        });
        localStorage.setItem(`score_${title}_versions`, JSON.stringify(versionsList));

        // Save to Flat.io API
        try {
          const response = await axios({
            method: 'post',
            url: `https://api.flat.io/v2/scores/${flatId}/revisions`,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': '069432b451ffceb35e2407e24093bd43a99e6a560963f9e92254da031a2e04e1527f86dfade9eb5cdb222720566f7a8dd8ac3beeed9a2d9d15a6d398123d125c'
            },
            data: {
              data: base64String,
              dataEncoding: "base64",
              autosave: false // Set to false for manual saves
            }
          });
          console.log('Manual save to Flat.io successful:', response.data);
        } catch (apiError) {
          console.error('Error saving to Flat.io:', apiError);
        }

        setLastSavedTime(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Error in manual save:', error);
      }
    }
  };

  const handleAutoSave = React.useCallback(async () => {
    console.log('Auto-save triggered');
    if (embedRef.current && flatId) {
      try {
        const buffer = await embedRef.current.getMusicXML({ compressed: true });
        
        const base64String = btoa(
          new Uint8Array(buffer)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        // Update modified timestamp using Firestore's serverTimestamp
        const scoreRef = doc(db, 'scores', id as string);
        await updateDoc(scoreRef, {
          modified: serverTimestamp()
        });

        const saveData = {
          title,
          timestamp: new Date().toISOString(),
          content: base64String
        };

        const storageKey = `score_${title}_autosave_${exportCount + 1}`;
        localStorage.setItem(storageKey, JSON.stringify(saveData));

        const versionsList = JSON.parse(localStorage.getItem(`score_${title}_versions`) || '[]');
        versionsList.push({
          version: `Auto Save ${exportCount + 1}`,
          timestamp: saveData.timestamp,
          storageKey
        });
        localStorage.setItem(`score_${title}_versions`, JSON.stringify(versionsList));

        // Save to Flat.io API
        try {
          const response = await axios({
            method: 'post',
            url: `https://api.flat.io/v2/scores/${flatId}/revisions`,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': '069432b451ffceb35e2407e24093bd43a99e6a560963f9e92254da031a2e04e1527f86dfade9eb5cdb222720566f7a8dd8ac3beeed9a2d9d15a6d398123d125c'
            },
            data: {
              data: base64String,
              dataEncoding: "base64",
              autosave: true
            }
          });
          console.log('Auto-save to Flat.io successful:', response.data);
        } catch (apiError) {
          console.error('Error auto-saving to Flat.io:', apiError);
        }
        
        setLastSavedTime(new Date().toLocaleTimeString());
        
        setExportCount(prev => prev + 1);
  

      } catch (error) {
        console.error('Error in auto-save:', error);
      }
    } else {
      console.log('Auto-save skipped - conditions not met:', { 
        hasEmbed: !!embedRef.current, 
        flatId 
      });
    }
  }, [flatId, exportCount, title]);

  // Set up auto-save interval
  useEffect(() => {
    handleAutoSave();

    console.log('Setting up auto-save interval');
    const intervalId = setInterval(handleAutoSave, exportInterval);

    return () => {
      console.log('Clearing auto-save interval');
      clearInterval(intervalId);
    };
  }, [flatId, handleAutoSave, exportCount]);

  // Function to update sharing settings in Firebase
  const updateSharingSetting = async (newSetting: string) => {
    if (!id) return;
    try {
      const scoreRef = doc(db, 'scores', id as string);
      await updateDoc(scoreRef, { sharing: newSetting });
      console.log('Sharing setting updated to:', newSetting);
    } catch (error) {
      console.error('Error updating sharing setting:', error);
    }
  };

  // Handle dropdown change
  const handleSharingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSetting = event.target.value;
    setSharingSetting(newSetting);
    updateSharingSetting(newSetting);
  };

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

        <div className="bg-white rounded-lg shadow-md relative">
          <div ref={containerRef} style={{ height: '450px', width: '100%' }} />
          <div className="p-6 border-t">
            <div className="flex flex-col gap-2">
              <div className="flex gap-4">
                <button 
                  onClick={handleManualSave}
                  className="px-4 py-2 bg-[#800000] text-white rounded hover:bg-[#600000] w-fit"
                >
                  Save Version
                </button>
                <button 
                  onClick={() => embedRef.current?.print()}
                  className="px-4 py-2 bg-[#800000] text-white rounded hover:bg-[#600000] w-fit"
                >
                  Print Score
                </button>
              </div>
              <span className="text-gray-600 text-sm">
                {lastSavedTime 
                  ? `Last saved at ${lastSavedTime}`
                  : firestoreModifiedTime 
                    ? `Last modified on ${firestoreModifiedTime}`
                    : "Preparing to auto-save..."}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <label htmlFor="sharing-settings" className="sr-only">
                Sharing Settings
              </label>
              <select
                id="sharing-settings"
                value={sharingSetting}
                onChange={handleSharingChange}
                className="px-4 py-2 bg-[#800000] text-white rounded hover:bg-[#600000] focus:outline-none"
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
              </select>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateAnotherScorePage;

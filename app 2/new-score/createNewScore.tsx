import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Bell, ChevronDown, User, ArrowLeft } from 'lucide-react'
import { Button } from "@/app/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import Link from "next/link"
import { auth } from '@/lib/firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'

declare global {
  interface Window {
    Flat: any;
  }
}

const CreateNewScorePage2 = ({ title }: { title: string }) => {
  const [user, setUser] = React.useState<any>(null)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<any>(null);
  const initializeRef = useRef(false);
  const [exportCount, setExportCount] = useState(0);
  const [scoreId, setScoreId] = useState<string | null>(null);
  const maxExports = 5;
  const exportInterval = 30000;

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const createScore = async () => {
    try {
      const response = await axios({
        method: 'post',
        url: 'https://api.flat.io/v2/scores',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': '069432b451ffceb35e2407e24093bd43a99e6a560963f9e92254da031a2e04e1527f86dfade9eb5cdb222720566f7a8dd8ac3beeed9a2d9d15a6d398123d125c'
        },
        data: {
          title: title,
          builderData: {
            scoreData: {
              instruments: [
                {
                  
                  group: "keyboards",
                  instrument: "piano"
                }
              ]
            }
          },
          privacy: "public"
        }
      });

      const newScoreId = response.data.id;
      setScoreId(newScoreId);

      // Update the Firebase document with the flatid
      const scoresRef = collection(db, 'scores');
      const q = query(scoresRef, where('name', '==', title));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const scoreDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'scores', scoreDoc.id), {
          flatid: newScoreId
        });
      }

      console.log('Score created with ID:', newScoreId);
      return newScoreId;
    } catch (error) {
      console.error('Error creating score:', error);
      return null;
    }
  };

  const handleManualSave = async () => {
    if (embedRef.current && scoreId) {
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
            url: `https://api.flat.io/v2/scores/${scoreId}/revisions`,
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
      } catch (error) {
        console.error('Error in manual save:', error);
      }
    }
  };

  const handleAutoSave = React.useCallback(async () => {
    console.log('Auto-save triggered');
    if (embedRef.current && scoreId) {
      try {
        const buffer = await embedRef.current.getMusicXML({ compressed: true });
        
        const base64String = btoa(
          new Uint8Array(buffer)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

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

        try {
          const response = await axios({
            method: 'post',
            url: `https://api.flat.io/v2/scores/${scoreId}/revisions`,
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
        
        setExportCount(prev => prev + 1);
        console.log(`Auto-saved (${exportCount + 1}/${maxExports})`);

      } catch (error) {
        console.error('Error in auto-save:', error);
      }
    } else {
      console.log('Auto-save skipped - conditions not met:', { 
        hasEmbed: !!embedRef.current, 
        scoreId 
      });
    }
  }, [scoreId, exportCount, title, maxExports]);

  const getSavedVersions = () => {
    try {
      return JSON.parse(localStorage.getItem(`score_${title}_versions`) || '[]');
    } catch (error) {
      console.error('Error retrieving saved versions:', error);
      return [];
    }
  };

  const loadVersion = (storageKey: string) => {
    try {
      const savedData = JSON.parse(localStorage.getItem(storageKey) || '');
      if (savedData) {
        const content = savedData.content;
        console.log('Loaded version:', savedData.timestamp);
        return content;
      }
    } catch (error) {
      console.error('Error loading version:', error);
    }
    return null;
  };

  // Initialize score and embed
  useEffect(() => {
    if (initializeRef.current) return;
    initializeRef.current = true;

    const initializeScore = async () => {
      const scoreId = await createScore();
      
      const script = document.createElement('script');
      script.src = 'https://prod.flat-cdn.com/embed-js/v1.5.1/embed.min.js';
      script.async = true;
      script.onload = () => {
        initializeEmbed(scoreId);
        console.log('Embed initialized');
      };
      document.body.appendChild(script);
    };

    initializeScore();
  }, []);

  // Set up auto-save interval
  useEffect(() => {
    // if (!scoreId || !embedRef.current || exportCount >= maxExports) {
    //   console.log('Auto-save setup skipped:', { 
    //     hasScoreId: !!scoreId, 
    //     hasEmbed: !!embedRef.current, 
    //     exportCount, 
    //     maxExports 
    //   });
    //   return;
    // }

    // Execute first auto-save immediately
    handleAutoSave();

    console.log('Setting up auto-save interval');
    const intervalId = setInterval(handleAutoSave, exportInterval);

    return () => {
      console.log('Clearing auto-save interval');
      clearInterval(intervalId);
    };
  }, [scoreId, handleAutoSave, exportCount, maxExports]);

  const initializeEmbed = (scoreId: string | null) => {
    if (containerRef.current && window.Flat && scoreId) {
      embedRef.current = new window.Flat.Embed(containerRef.current, {
        score: scoreId,
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

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link href="/dashboard">
              <img src="/tmdb-logo.png" alt="TMDB Logo" className="h-10" />
            </Link>
            <nav className="flex space-x-6">
              <Link href="/dashboard" className="text-[#333333] hover:text-[#800000] font-medium">My scores</Link>
              <Link href="/community" className="text-[#333333] hover:text-[#800000] font-medium">Community</Link>
              <Link href="#" className="text-[#333333] hover:text-[#800000] font-medium">Browse & Explore</Link>
              <Link href="#" className="text-[#333333] hover:text-[#800000] font-medium">Learn</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="text-[#333333] hover:text-[#800000] cursor-pointer" />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="text-[#333333]" />
                  <ChevronDown className="text-[#333333]" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-[#800000] flex items-center justify-center text-white">
                    {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user?.displayName || 'User'}</p>
                    <Link href="#" className="text-xs text-[#800000] hover:underline">View profile</Link>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Link href="#" className="block text-sm text-[#333333] hover:text-[#800000]">Account settings</Link>
                  <Link href="#" className="block text-sm text-[#333333] hover:text-[#800000]">Contact us</Link>
                  <Link href="#" className="block text-sm text-[#333333] hover:text-[#800000]">Help</Link>
                  <button onClick={handleLogout} className="block w-full text-left text-sm text-[#333333] hover:text-[#800000]">Logout</button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/new-score" className="flex items-center text-[#800000] hover:text-[#600000]">
            <ArrowLeft className="mr-2" />
            Back to Score Details
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold text-[#333333] mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">By {user?.displayName || 'Anonymous'}</p>

        <div className="bg-white rounded-lg shadow-md">
          <div ref={containerRef} style={{ height: '450px', width: '100%' }} />
          <div className="p-6 border-t">
            <div className="flex items-center justify-between">
              <button 
                onClick={handleManualSave}
                className="px-4 py-2 bg-[#800000] text-white rounded hover:bg-[#600000]"
              >
                Save Version
              </button>
              <span className="text-sm text-gray-600">
                Auto-save: {exportCount}/{maxExports}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Saved Versions</h3>
              <div className="space-y-2">
                {getSavedVersions().map((version: any) => (
                  <div key={version.storageKey} className="flex items-center justify-between text-sm">
                    <span>Version {version.version} - {new Date(version.timestamp).toLocaleString()}</span>
                    <button 
                      onClick={() => loadVersion(version.storageKey)}
                      className="text-[#800000] hover:text-[#600000]"
                    >
                      Load
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateNewScorePage2;

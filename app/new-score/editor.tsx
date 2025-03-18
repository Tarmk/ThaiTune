'use client'

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase'

interface EditorProps {
  title: string;
  user: any;
}

const Editor = ({ title, user }: EditorProps) => {
  const API_KEY = process.env.NEXT_PUBLIC_FLAT_IO_API_KEY;
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<any>(null);
  const [exportCount, setExportCount] = useState(0);
  const [scoreId, setScoreId] = useState<string | null>(null);
  const maxExports = 5;
  const exportInterval = 30000;

  const createScore = async () => {
    try {
      const response = await axios({
        method: 'post',
        url: 'https://api.flat.io/v2/scores',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        data: { // ✅ Fix: Move `data` outside `headers`
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
  
      const scoresRef = collection(db, 'scores');
      const q = query(scoresRef, where('name', '==', title));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const scoreDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'scores', scoreDoc.id), {
          flatid: newScoreId
        });
      }
  
      return newScoreId;
    } catch (error) {
      console.error('Error creating score:', error);
      return null;
    }
  };
  
  const handleSave = async (isAutoSave = false) => {
    if (!embedRef.current || !scoreId) return;

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

      const storageKey = isAutoSave 
        ? `score_${title}_autosave_${exportCount + 1}`
        : `score_${title}_manual_${Date.now()}`;
      
      localStorage.setItem(storageKey, JSON.stringify(saveData));

      const versionsList = JSON.parse(localStorage.getItem(`score_${title}_versions`) || '[]');
      versionsList.push({
        version: isAutoSave ? `Auto Save ${exportCount + 1}` : `Manual Save ${versionsList.length + 1}`,
        timestamp: saveData.timestamp,
        storageKey
      });
      localStorage.setItem(`score_${title}_versions`, JSON.stringify(versionsList));

      try {
        await axios({
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
            autosave: isAutoSave
          }
        });

        if (isAutoSave) {
          setExportCount(prev => prev + 1);
        }
      } catch (apiError) {
        console.error('Error saving to Flat.io:', apiError);
      }
    } catch (error) {
      console.error('Error in save:', error);
    }
  };

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
        return content;
      }
    } catch (error) {
      console.error('Error loading version:', error);
    }
    return null;
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const newScoreId = await createScore();
      if (!mounted) return;

      if (typeof window !== 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://prod.flat-cdn.com/embed-js/v1.5.1/embed.min.js';
        script.async = true;
        script.onload = () => {
          if (!mounted || !containerRef.current || !window.Flat || !newScoreId) return;
          
          embedRef.current = new window.Flat.Embed(containerRef.current, {
            score: newScoreId,
            embedParams: {
              mode: 'edit',
              appId: '675579130b7f5c8a374ac19a',
              branding: false,
              controlsPosition: 'top',
              themePrimary: '#800000'
            }
          });
        };
        document.body.appendChild(script);
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!scoreId || exportCount >= maxExports) return;

    const intervalId = setInterval(() => {
      handleSave(true);
    }, exportInterval);

    return () => clearInterval(intervalId);
  }, [scoreId, exportCount]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 mt-16">
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
              onClick={() => handleSave(false)}
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
  );
};

export default Editor; 
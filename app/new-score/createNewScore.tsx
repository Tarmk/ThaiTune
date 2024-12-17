import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

declare global {
  interface Window {
    Flat: any;
  }
}

const CreateNewScorePage2 = ({ title }: { title: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<any>(null);
  const initializeRef = useRef(false);
  const [exportCount, setExportCount] = useState(0);
  const [scoreId, setScoreId] = useState<string | null>(null);
  const maxExports = 5;
  const exportInterval = 5000;

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
      console.log('Score created:', response.data);
      setScoreId(response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('Error creating score:', error);
      return null;
    }
  };

  const handleExport = React.useCallback(async () => {
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
          version: exportCount + 1,
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
          console.log('Revision saved to Flat.io:', response.data);
        } catch (apiError) {
          console.error('Error saving revision to Flat.io:', apiError);
        }
        
        setExportCount(prev => prev + 1);
        console.log(`Auto-saved score to storage and Flat.io (${exportCount + 1}/${maxExports})`);

      } catch (error) {
        console.error('Error saving MusicXML:', error);
      }
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

  useEffect(() => {
    if (initializeRef.current) return;
    initializeRef.current = true;

    const initializeScore = async () => {
      const scoreId = await createScore();
      
      const script = document.createElement('script');
      script.src = 'https://prod.flat-cdn.com/embed-js/v1.5.1/embed.min.js';
      script.async = true;
      script.onload = () => initializeEmbed(scoreId);
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    };

    initializeScore();
  }, []);

  useEffect(() => {
    if (!scoreId || !embedRef.current || exportCount >= maxExports) return;

    console.log('Setting up auto-save interval');
    const intervalId = setInterval(() => {
      handleExport();
    }, exportInterval);

    return () => {
      console.log('Clearing auto-save interval');
      clearInterval(intervalId);
    };
  }, [exportCount, scoreId, handleExport]);

  const initializeEmbed = (scoreId: string | null) => {
    if (containerRef.current && window.Flat && scoreId) {
      embedRef.current = new window.Flat.Embed(containerRef.current, {
        score: scoreId,
        embedParams: {
          mode: 'edit',
          appId: '675579130b7f5c8a374ac19a',
          branding: false,
          controlsPosition: 'top',
        }
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Score Page 2</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div ref={containerRef} style={{ height: '450px', width: '100%' }} />
        <div className="mt-4 flex items-center justify-between">
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
                  className="text-blue-500 hover:text-blue-600"
                >
                  Load
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewScorePage2;

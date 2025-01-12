'use client'

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Bell, ChevronDown, User, ArrowLeft } from 'lucide-react'
import { Button } from "@/_app/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/_app/components/ui/popover"
import Link from "next/link"
import { auth } from '@/lib/firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'
import { TopMenu } from '@/app/components/TopMenu'
import dynamic from 'next/dynamic'

interface FlatEmbed {
  getMusicXML: (options: { compressed: boolean }) => Promise<ArrayBuffer>;
}

declare global {
  interface Window {
    Flat: {
      Embed: new (container: HTMLDivElement, options: any) => FlatEmbed;
    };
  }
}

// Separate component for the editor
const Editor = dynamic(() => import('./editor'), { ssr: false });

// Main component
const CreateNewScorePage2 = ({ title }: { title: string }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })
    return () => unsubscribe()
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <TopMenu user={user} />
      <Editor title={title} user={user} />
    </div>
  );
};

export default CreateNewScorePage2;

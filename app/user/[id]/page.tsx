"use client"

import * as React from "react"
import { collection, query, where, getDocs, Timestamp, getDoc, doc, updateDoc, arrayUnion, arrayRemove, runTransaction } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { TopMenu } from "@/app/components/layout/TopMenu"
import Footer from "@/app/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Star, Music, Users, Calendar, BookOpen, PlusCircle } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import { useTheme } from "next-themes"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/app/providers/auth-provider"
import { useParams } from "next/navigation"
import Image from "next/image"
import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"

interface UserProfile {
  displayName: string
  bio: string
  roles: string[]
  profilePictureUrl: string
  coverImageUrl: string
  createdAt: Timestamp
  followers: string[]
  following: string[]
}

interface Score {
  id: string
  title: string
  rating: number
  createdAt: Timestamp | null
  flatid: string
}

interface FetchedScore {
  id: string
  title: string
  composer: string
  arrangement: string
  genre: string
  createdAt: Timestamp | null
  rating: number
  author: string
  flatid: string
}

// Empty state components
const EmptyScoresCard = ({ isOwnProfile }: { isOwnProfile: boolean }) => (
  <Card className="h-full flex items-center justify-center p-8 border-dashed border-2">
    <div className="text-center space-y-4">
      <Music className="w-12 h-12 mx-auto text-muted-foreground" />
      <div>
        <h3 className="font-semibold text-lg mb-2">
          {isOwnProfile ? "No scores yet" : "No public scores"}
        </h3>
        <p className="text-muted-foreground text-sm mb-4">
          {isOwnProfile 
            ? "Start creating your first musical score to share with the community"
            : "This user hasn't shared any public scores yet"
          }
        </p>
        {isOwnProfile && (
          <Link href="/new-score">
            <Button className="mt-2">
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Your First Score
            </Button>
          </Link>
        )}
      </div>
    </div>
  </Card>
)

const DefaultBioCard = ({ isOwnProfile, userName }: { isOwnProfile: boolean, userName: string }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        Bio
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {isOwnProfile 
            ? "Tell the community about yourself! Share your musical journey, favorite genres, or what inspires your compositions."
            : `${userName} is a member of our musical community. They haven't shared their story yet, but every musician has a unique journey worth discovering.`
          }
        </p>
        {isOwnProfile && (
          <Link href="/settings">
            <Button variant="outline" size="sm">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Bio
            </Button>
          </Link>
        )}
      </div>
    </CardContent>
  </Card>
)

export default function UserProfilePage() {
  const params = useParams()
  const id = params.id as string
  const { user: currentUser } = useAuth()
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null)
  const [scores, setScores] = React.useState<Score[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isFollowing, setIsFollowing] = React.useState(false)
  const [followersCount, setFollowersCount] = React.useState(0)
  const [isUpdatingFollow, setIsUpdatingFollow] = React.useState(false)
  const { t } = useTranslation(["common", "dashboard"])
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => { setMounted(true) }, [])

  const pageBg = mounted && resolvedTheme === "dark" ? "#1a1f2c" : "#f3f4f6"
  const cardBg = mounted && resolvedTheme === "dark" ? "#242A38" : "white"
  const textColor = mounted && resolvedTheme === 'dark' ? 'white' : '#111827'

  React.useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return
      setLoading(true)
      try {
        const userDocRef = doc(db, "users", id)
        const userDoc = await getDoc(userDocRef)
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile

          // One-time update for specific user's creation date
          if (userData.displayName === "Krittaphas Kunkhongkaphan" && userData.createdAt && userData.createdAt.toDate().getFullYear() !== 2022) {
            const newDate = Timestamp.fromDate(new Date('2022-05-02'))
            await updateDoc(userDocRef, { createdAt: newDate })
            userData.createdAt = newDate
          }
          
          setUserProfile(userData)
          setFollowersCount(userData.followers?.length || 0)
        }

        const q = query(collection(db, "scores"), where("userId", "==", id), where("sharing", "==", "public"))
        const querySnapshot = await getDocs(q)
        const userScores = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            title: data.name,
            composer: data.composer,
            arrangement: data.arrangement,
            genre: data.genre,
            createdAt: data.created || null,
            rating: data.rating || 0,
            author: userProfile?.displayName || 'Unknown',
            flatid: data.flatid,
          }
        }) as Score[]
        setScores(userScores)
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [id])

  React.useEffect(() => {
    if (userProfile && currentUser) {
      setIsFollowing(userProfile.followers?.includes(currentUser.uid) || false)
    }
  }, [userProfile, currentUser])

  const handleFollowToggle = async () => {
    if (!currentUser || !userProfile || isUpdatingFollow) return
    setIsUpdatingFollow(true)

    const currentUserRef = doc(db, "users", currentUser.uid)
    const targetUserRef = doc(db, "users", id)

    try {
      await runTransaction(db, async (transaction) => {
        if (isFollowing) {
          // Unfollow
          transaction.update(currentUserRef, { following: arrayRemove(id) })
          transaction.update(targetUserRef, { followers: arrayRemove(currentUser.uid) })
        } else {
          // Follow
          transaction.update(currentUserRef, { following: arrayUnion(id) })
          transaction.update(targetUserRef, { followers: arrayUnion(currentUser.uid) })
        }
      })
      
      setIsFollowing(!isFollowing)
      setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1)
    } catch (error) {
      console.error("Failed to update follow status:", error)
    } finally {
      setIsUpdatingFollow(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center" style={{ background: pageBg }}>
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      </div>
    )
  }

  const spotlightScores = scores.slice(0, 2)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopMenu />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        {loading ? (
          <div className="flex flex-col min-h-screen items-center justify-center" style={{ background: pageBg }}>
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          </div>
        ) : userProfile ? (
          <div>
            <div
              className="w-full h-48 md:h-64 bg-cover bg-center rounded-lg relative"
              style={{ backgroundImage: `url(${userProfile.coverImageUrl || '/images/default-cover.jpg'})` }}
            >
              <div className="absolute bottom-[-50px] left-8">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-background p-1">
                  <Image
                    src={userProfile.profilePictureUrl || "/placeholder-user.jpg"}
                    alt={userProfile.displayName || "User"}
                    width={144}
                    height={144}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="mt-20 md:mt-16 flex justify-between items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {userProfile?.displayName || "User Profile"}
                </h1>
                {currentUser && currentUser.uid !== id && (
                  <div className="flex space-x-2 mt-2">
                    <Button onClick={handleFollowToggle} disabled={isUpdatingFollow}>
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <Button variant="ghost">...</Button>
                  </div>
                )}
              </div>
            </div>

            <Tabs defaultValue="profile" className="mt-6">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="favorites">Favorite Scores</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between"><span>Scores</span> <span>{scores.length}</span></div>
                        <div className="flex justify-between"><span>Followers</span> <span>{followersCount}</span></div>
                        <div className="flex justify-between">
                          <span>Member since</span>
                          <span>
                            {userProfile.createdAt
                              ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Bio</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {userProfile.bio || "This user hasn't written a bio yet."}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="lg:col-span-2">
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-bold mb-4">Spotlight</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {scores.slice(0, 3).map((score) => (
                            <Link href={`/score/${score.id}`} key={score.id}>
                              <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                                <div className="relative w-full h-60">
                                  <Image
                                    src={score.flatid ? `https://flat.io/api/v2/scores/${score.flatid}/revisions/last/thumbnail.png?width=600&height=800` : "/placeholder.svg"}
                                    alt={score.title || "Score thumbnail"}
                                    fill
                                    style={{ objectFit: "contain", objectPosition: "top" }}
                                    className="bg-white"
                                  />
                                </div>
                                <CardContent className="p-4 text-center">
                                  <p className="font-semibold truncate">{score.title}</p>
                                  <div className="flex items-center justify-center mt-2">
                                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                    <span>{score.rating.toFixed(1)}</span>
                                  </div>
                                  {score.createdAt && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {score.createdAt?.toDate().toLocaleDateString()}
                                    </p>
                                  )}
                                </CardContent>
                              </Card>
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h2 className="text-2xl font-bold mb-4">Sheet Music</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {scores.map((score) => (
                            <Link href={`/score/${score.id}`} key={score.id}>
                              <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                                <div className="relative w-full h-60">
                                  <Image
                                    src={score.flatid ? `https://flat.io/api/v2/scores/${score.flatid}/revisions/last/thumbnail.png?width=600&height=800` : "/placeholder.svg"}
                                    alt={score.title || "Score thumbnail"}
                                    fill
                                    style={{ objectFit: "contain", objectPosition: "top" }}
                                    className="bg-white"
                                  />
                                </div>
                                <CardContent className="p-4 text-center">
                                  <p className="font-semibold truncate">{score.title}</p>
                                  <div className="flex items-center justify-center mt-2">
                                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                    <span>{score.rating.toFixed(1)}</span>
                                  </div>
                                  {score.createdAt && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {score.createdAt?.toDate().toLocaleDateString()}
                                    </p>
                                  )}
                                </CardContent>
                              </Card>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="favorites">
                <p>Coming soon!</p>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center">
            <p>User not found.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
} 
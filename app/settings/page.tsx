"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { auth, db, storage } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { ProtectedRoute } from "@/app/components/auth/protectedroute"
import { TopMenu } from "@/app/components/layout/TopMenu"
import { useTranslation } from "react-i18next"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useTheme } from "next-themes"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import { useAuth } from "@/app/providers/auth-provider"
import Footer from "@/app/components/layout/Footer"

const settingsSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters.").max(50, "Display name must be at most 50 characters."),
  bio: z.string().max(160, "Bio must be at most 160 characters.").optional(),
  roles: z.string().optional(),
  profilePictureUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const { user: authUser } = useAuth()
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()
  const { t } = useTranslation(['common'])
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [profilePicFile, setProfilePicFile] = React.useState<File | null>(null)
  const [coverImageFile, setCoverImageFile] = React.useState<File | null>(null)
  const [profilePicPreview, setProfilePicPreview] = React.useState<string | null>(null)
  const [coverImagePreview, setCoverImagePreview] = React.useState<string | null>(null)
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      roles: "",
      profilePictureUrl: "",
      coverImageUrl: "",
    },
  })

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (authUser) {
      const fetchUserData = async () => {
        setIsLoading(true)
        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, "users", authUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            reset({
              displayName: userData.displayName || authUser.displayName || "",
              bio: userData.bio || "",
              roles: Array.isArray(userData.roles) ? userData.roles.join(', ') : (userData.roles || ""),
              profilePictureUrl: userData.profilePictureUrl || "",
              coverImageUrl: userData.coverImageUrl || "",
            })
            if (userData.profilePictureUrl) setProfilePicPreview(userData.profilePictureUrl)
            if (userData.coverImageUrl) setCoverImagePreview(userData.coverImageUrl)
          } else {
             reset({
              displayName: authUser.displayName || "",
              bio: "",
              roles: "",
              profilePictureUrl: "",
              coverImageUrl: "",
            })
          }
        } catch (error) {
          console.error("Error fetching user settings:", error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchUserData()
    } else {
       setIsLoading(false)
    }
  }, [authUser, reset])
  
  // Theme-aware colors
  const textColor = "hsl(var(--primary))"

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const previewUrl = URL.createObjectURL(file)
      if (type === 'profile') {
        setProfilePicFile(file)
        setProfilePicPreview(previewUrl)
      } else {
        setCoverImageFile(file)
        setCoverImagePreview(previewUrl)
      }
    }
  }

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    return getDownloadURL(storageRef)
  }

  const onSubmit = async (data: SettingsFormValues) => {
    if (!authUser) {
      console.error('No authenticated user');
      return;
    }
    
    setSaving(true);

    try {
      // Start with basic user data
      const updateData: any = {
        displayName: data.displayName || '',
        bio: data.bio || '',
      };

      // Handle roles - convert string to array
      if (data.roles) {
        updateData.roles = data.roles.split(',').map((role: string) => role.trim()).filter((role: string) => role.length > 0);
      } else {
        updateData.roles = [];
      }

      // Handle profile picture upload
      if (profilePicFile) {
        const profileUrl = await uploadImage(profilePicFile, `users/${authUser.uid}/profile-picture`);
        updateData.profilePictureUrl = profileUrl;
      }

      // Handle cover image upload
      if (coverImageFile) {
        const coverUrl = await uploadImage(coverImageFile, `users/${authUser.uid}/cover-image`);
        updateData.coverImageUrl = coverUrl;
      }

      // Update Firestore
      const userDocRef = doc(db, "users", authUser.uid);
      await updateDoc(userDocRef, updateData);

      // Reset file states after successful upload
      setProfilePicFile(null);
      setCoverImageFile(null);

      toast({
        title: t('success'),
        description: t('settingsUpdatedSuccess'),
      });

    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: t('error'),
        description: `${t('settingsUpdateError')}: ${error instanceof Error ? error.message : t('unknownError')}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }



  const handleViewProfile = () => {
    if (authUser) {
      router.push(`/user/${authUser.uid}`)
    }
  }



  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#1a1f2c]">
        <TopMenu />
        <main className="flex-grow container mx-auto px-4 py-8 mt-16">
          <div className="max-w-2xl mx-auto">
            {/* Title skeleton */}
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8" />
            
            {/* Form skeleton */}
            <div className="space-y-6">
              {/* Profile Picture section */}
              <div className="space-y-4">
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-24 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              </div>
              
              {/* Form fields */}
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              ))}
              
              {/* Bio section */}
              <div className="space-y-2">
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              
              {/* Save button */}
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <TopMenu />
        <main className="flex-grow container mx-auto px-4 md:px-6 pt-20 pb-6">
          <div className="mb-6">
            <button 
              onClick={() => router.back()} 
              className="flex items-center hover:underline"
              style={{ color: textColor }}
            >
              <ArrowLeft className="mr-2" />
              {t('back')}
            </button>
          </div>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-[#333333] dark:text-white">{t('settings')}</CardTitle>
                <CardDescription className="dark:text-gray-400">{t('manageAccountDescription')}</CardDescription>
              </div>
              <Button onClick={handleViewProfile} variant="outline">{t('viewProfile')}</Button>
            </CardHeader>
            <CardContent className="space-y-6">


              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2 dark:text-white">{t('profileInformation')}</h3>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="displayName" className="dark:text-gray-300">{t('displayName')}</Label>
                      <Controller
                        name="displayName"
                        control={control}
                        render={({ field }) => <Input id="displayName" {...field} />}
                      />
                      {errors.displayName && <p className="text-sm text-red-500">{errors.displayName.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="bio" className="dark:text-gray-300">{t('bio')}</Label>
                      <Controller
                        name="bio"
                        control={control}
                        render={({ field }) => <Textarea id="bio" {...field} />}
                      />
                      {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="roles" className="dark:text-gray-300">{t('roles')}</Label>
                      <Controller
                        name="roles"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="roles"
                            {...field}
                            placeholder={t('rolesPlaceholder')}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <Label htmlFor="profilePictureUrl" className="dark:text-gray-300">{t('profilePicture')}</Label>
                      <div className="flex items-center space-x-4">
                        {profilePicPreview && (
                          <Image
                            src={profilePicPreview}
                            alt="Profile preview"
                            width={80}
                            height={80}
                            className="rounded-full w-20 h-20 object-cover"
                          />
                        )}
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('profilePictureUrl')?.click()}
                              className="text-sm"
                            >
                              {t('chooseFile')}
                            </Button>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {profilePicFile ? profilePicFile.name : t('noFileChosen')}
                            </span>
                          </div>
                          <Input 
                            id="profilePictureUrl" 
                            type="file" 
                            onChange={(e) => handleFileChange(e, 'profile')} 
                            className="hidden" 
                            accept="image/*"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="coverImageUrl" className="dark:text-gray-300">{t('coverImage')}</Label>
                      <div className="flex items-center space-x-4">
                        {coverImagePreview && (
                          <Image
                            src={coverImagePreview}
                            alt="Cover preview"
                            width={200}
                            height={100}
                            className="rounded-md w-48 h-24 object-cover"
                          />
                        )}
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('coverImageUrl')?.click()}
                              className="text-sm"
                            >
                              {t('chooseFile')}
                            </Button>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {coverImageFile ? coverImageFile.name : t('noFileChosen')}
                            </span>
                          </div>
                          <Input 
                            id="coverImageUrl" 
                            type="file" 
                            onChange={(e) => handleFileChange(e, 'cover')} 
                            className="hidden" 
                            accept="image/*"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('email')}: {authUser?.email || t('notSet')}</p>
                    </div>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  style={{ backgroundColor: textColor, color: 'white' }} 
                  disabled={saving}
                >
                  {saving ? t('saving') : t('saveChanges')}
                </Button>
              </form>


            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
} 
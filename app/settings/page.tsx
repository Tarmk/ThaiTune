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
        title: "Success",
        description: "Your settings have been updated successfully.",
      });

    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: `Failed to update settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
       <div className="flex flex-col min-h-screen items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
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
              Back
            </button>
          </div>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-[#333333] dark:text-white">{t('settings')}</CardTitle>
                <CardDescription className="dark:text-gray-400">Manage your account and profile settings.</CardDescription>
              </div>
              <Button onClick={handleViewProfile} variant="outline">View Profile</Button>
            </CardHeader>
            <CardContent className="space-y-6">


              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2 dark:text-white">Profile Information</h3>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="displayName" className="dark:text-gray-300">Display Name</Label>
                      <Controller
                        name="displayName"
                        control={control}
                        render={({ field }) => <Input id="displayName" {...field} />}
                      />
                      {errors.displayName && <p className="text-sm text-red-500">{errors.displayName.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="bio" className="dark:text-gray-300">Bio</Label>
                      <Controller
                        name="bio"
                        control={control}
                        render={({ field }) => <Textarea id="bio" {...field} />}
                      />
                      {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="roles" className="dark:text-gray-300">Roles</Label>
                      <Controller
                        name="roles"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="roles"
                            {...field}
                            placeholder="e.g. Composer, Performer"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <Label htmlFor="profilePictureUrl" className="dark:text-gray-300">Profile Picture</Label>
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
                        <Input id="profilePictureUrl" type="file" onChange={(e) => handleFileChange(e, 'profile')} className="max-w-xs" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="coverImageUrl" className="dark:text-gray-300">Cover Image</Label>
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
                        <Input id="coverImageUrl" type="file" onChange={(e) => handleFileChange(e, 'cover')} className="max-w-xs" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email: {authUser?.email || "Not set"}</p>
                    </div>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  style={{ backgroundColor: textColor, color: 'white' }} 
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
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
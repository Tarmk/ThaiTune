import { Card, CardContent } from "@/app/components/ui/card"
import { TopMenu } from "@/app/components/layout/TopMenu"
import Footer from "../components/layout/Footer"

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#1a1f2c]">
      <TopMenu />
      <main className="flex-grow max-w-7xl mx-auto px-4 pt-20 pb-6 w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="flex items-center space-x-4">
            <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
        <Card className="bg-white dark:bg-[#232838] shadow-md">
          <CardContent>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="py-2"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></th>
                  <th className="py-2"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></th>
                  <th className="py-2"><div className="h-4 w-14 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></th>
                  <th className="py-2"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></th>
                  <th className="py-2"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></th>
                  <th className="py-2"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></th>
                </tr>
              </thead>
              <tbody>
                {[...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b last:border-b-0 dark:border-gray-700">
                    <td className="py-3">
                      <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </td>
                    <td className="py-3">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </td>
                    <td className="py-3">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </td>
                    <td className="py-3">
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </td>
                    <td className="py-3">
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </td>
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

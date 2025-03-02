'use client'

import Link from "next/link"
import { useTranslation } from 'next-i18next'
import { Button } from './Button'

export default function Main() {
  const { t } = useTranslation('common')

  return (
    <main className="flex-1 pt-16">
      <section className="w-full py-20">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl font-bold tracking-tight text-gray-900 lg:text-6xl/none">
                  {t('learnTitle')}
                </h1>
                <p className="text-xl text-gray-500 max-w-[600px]">
                  {t('description')}
                </p>
              </div>
              <div>
                <Link href="/signup">
                  <Button className="text-base px-6 py-3">
                    {t('getStarted')}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full aspect-[4/3]">
                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Placeholder Image</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-20 bg-gray-50">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="space-y-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                {t('widenRepertoire')}
              </h2>
              <p className="mt-4 text-xl text-gray-500">
                {t('uploadDescription')}
              </p>
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gray-100 aspect-[2/1] flex items-center justify-center">
              <span className="text-gray-400">{t('editorInterface')}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 
'use client'

import { useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface Props {
  onUploaded: (url: string) => void
  label?: string
}

export function ImageUpload({ onUploaded, label = '上传图片' }: Props) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '上传失败')
      }
      const data = await res.json()
      onUploaded(data.url)
      toast({ title: '上传成功' })
    } catch (err) {
      toast({ title: '上传失败', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  return (
    <>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
        id="img-upload-input"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={() => document.getElementById('img-upload-input')?.click()}
      >
        {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}
        {loading ? '上传中' : label}
      </Button>
    </>
  )
}

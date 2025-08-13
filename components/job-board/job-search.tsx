'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function JobSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    
    if (searchTerm.trim()) {
      current.set('search', searchTerm.trim())
    } else {
      current.delete('search')
    }
    
    // Reset to first page on new search
    current.delete('page')
    
    const search = current.toString()
    const query = search ? `?${search}` : ''
    
    router.push(`/jobs${query}`)
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search jobs, companies, or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2">
        Search
      </Button>
    </form>
  )
}
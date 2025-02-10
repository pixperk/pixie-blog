"use client"

import { useState, useCallback, useEffect } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { toast } from "react-hot-toast"
import axios from "axios"
import debounce from "lodash.debounce"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface Tag {
  value: string
  label: string
}

interface SelectTagsProps {
  tags: Tag[]
  setTags: (tags: Tag[]) => void
  selectedTags: string[]
  setSelectedTags: (tags: string[]) => void
  setPost: (post: (prev: any) => any) => void
}

export function SelectTags({ tags, setTags, selectedTags, setSelectedTags, setPost }: SelectTagsProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)

  const handleTagSelect = useCallback(
    (tag: string) => {
      const updatedTags = selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag]
      setSelectedTags(updatedTags)
      setPost((prev) => ({ ...prev, tags: updatedTags }))
    },
    [selectedTags, setSelectedTags, setPost],
  )

  const handleRemoveTag = useCallback(
    (tag: string) => {
      const updatedTags = selectedTags.filter((t) => t !== tag)
      setSelectedTags(updatedTags)
      setPost((prev) => ({ ...prev, tags: updatedTags }))
    },
    [selectedTags, setSelectedTags, setPost],
  )

  const handleAddCustomTag = useCallback(
    (value: string) => {
      if (!value.trim()) return
      const newTag = value.trim()
      if (!selectedTags.includes(newTag)) {
        const updatedTags = [...selectedTags, newTag]
        setSelectedTags(updatedTags)
        setPost((prev) => ({ ...prev, tags: updatedTags }))
        toast.success(`Added custom tag: ${newTag}`)
      }
      setQuery("")
    },
    [selectedTags, setSelectedTags, setPost],
  )

  const fetchTags = useCallback(
    async (query: string) => {
      if (!query) {
        setTags([])
        return
      }
      setLoading(true)
      try {
        const response = await axios.get(
          `https://api.stackexchange.com/2.3/tags`,
          {
            params: {
              order: "desc",
              sort: "popular",
              site: "stackoverflow",
              inname: query,
            },
          }
        )
        const data = response.data
        if (data.items) {
          const fetchedTags = data.items.map((tag: { name: string }) => ({
            value: tag.name,
            label: tag.name,
          }))
          setTags(fetchedTags)
        } else {
          setTags([])
          toast.error("No tags found.")
        }
      } catch (error) {
        console.error("Error fetching tags:", error)
        toast.error("Failed to fetch tags. Please try again later.")
      } finally {
        setLoading(false)
      }
    },
    [setTags]
  )
  

  const debouncedFetchTags = useCallback(debounce(fetchTags, 300), [fetchTags]) 

  useEffect(() => {
    debouncedFetchTags(query)
    return () => {
      debouncedFetchTags.cancel()
    }
  }, [query, debouncedFetchTags]) 
  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-gray-800 text-gray-300 border-neon-green-400 hover:bg-gray-700 hover:text-gray-100"
          >
            {selectedTags.length > 0
              ? `${selectedTags.length} tag${selectedTags.length > 1 ? "s" : ""} selected`
              : "Select tags..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <div className="bg-gray-800 text-gray-300 p-2">
            <Input
              placeholder="Search tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-neon-green-400 bg-gray-700 text-gray-100 mb-2"
            />
            <div className="max-h-[200px] overflow-y-auto">
              {loading ? (
                <div className="text-center py-2">Loading...</div>
              ) : tags.length > 0 ? (
                tags.map((tag) => (
                  <div
                    key={tag.value}
                    onClick={() => handleTagSelect(tag.value)}
                    className="flex items-center p-2 cursor-pointer hover:bg-gray-700 rounded"
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", selectedTags.includes(tag.value) ? "opacity-100" : "opacity-0")}
                    />
                    {tag.label}
                  </div>
                ))
              ) : (
                <div className="text-center py-2">No tags found</div>
              )}
            </div>
            {query && (
              <Button
                className="w-full mt-2 bg-neon-green-400 text-gray-900 hover:bg-neon-green-300"
                onClick={() => handleAddCustomTag(query)}
              >
                Add "{query}" as custom tag
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedTags.map((tag) => (
          <Badge key={tag} variant="secondary" className="bg-neon-green-400 text-gray-900 hover:bg-neon-green-300">
            {tag}
            <Button
              variant="ghost"
              size="sm"
              className="ml-1 p-0 h-auto text-gray-900 hover:text-gray-700 hover:bg-transparent"
              onClick={() => handleRemoveTag(tag)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  )
}


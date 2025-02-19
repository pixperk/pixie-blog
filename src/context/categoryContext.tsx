"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { getTrendingTags } from "@/server/blog"

interface CategoriesContextType {
  categories: string[]
  loading: boolean
}

const CategoriesContext = createContext<CategoriesContextType>({
  categories: [],
  loading: true,
})

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      const cachedData = localStorage.getItem("trendingCategories")
      const expiry = localStorage.getItem("trendingCategoriesExpiry")

      if (cachedData && expiry && new Date().getTime() < Number(expiry)) {
        setCategories(JSON.parse(cachedData))
        setLoading(false)
      } else {
        try {
          const fetchedCategories = await getTrendingTags()
          const capitalizedCategories = fetchedCategories.map(
            (cat: string) => cat.charAt(0).toUpperCase() + cat.slice(1)
          )

          localStorage.setItem("trendingCategories", JSON.stringify(capitalizedCategories))
          localStorage.setItem("trendingCategoriesExpiry", (new Date().getTime() + 2 * 60 * 60 * 1000).toString())

          setCategories(capitalizedCategories)
        } catch (error) {
          console.error("Failed to fetch categories:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchCategories()
  }, [])

  return (
    <CategoriesContext.Provider value={{ categories, loading }}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  return useContext(CategoriesContext)
}

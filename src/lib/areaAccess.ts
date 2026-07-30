import { useMemo } from 'react'
import { AREAS } from '../data/mockData'
import type { Area } from '../api/types'
import { useAuth } from '../context/AuthContext'

export function filterAreasByAccess(areas: Area[], allowedAreaIds?: string[]): Area[] {
  if (allowedAreaIds === undefined) return areas
  const allowed = new Set(allowedAreaIds)
  return areas.filter((a) => allowed.has(a.id))
}

export function canAccessAreaId(areaId: string, allowedAreaIds?: string[]): boolean {
  if (allowedAreaIds === undefined) return true
  return allowedAreaIds.includes(areaId)
}

export function canAccessAreaSlug(slug: string, allowedAreaIds?: string[]): boolean {
  const area = AREAS.find((a) => a.slug === slug)
  if (!area) return false
  return canAccessAreaId(area.id, allowedAreaIds)
}

export function useAllowedAreas(): Area[] {
  const { user } = useAuth()
  return useMemo(
    () => filterAreasByAccess(AREAS, user?.allowedAreaIds),
    [user?.allowedAreaIds],
  )
}

export function useCanAccessArea(areaIdOrSlug: string): boolean {
  const { user } = useAuth()
  const allowed = user?.allowedAreaIds
  const byId = AREAS.find((a) => a.id === areaIdOrSlug)
  if (byId) return canAccessAreaId(byId.id, allowed)
  return canAccessAreaSlug(areaIdOrSlug, allowed)
}

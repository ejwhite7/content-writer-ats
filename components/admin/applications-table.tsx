'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, MoreHorizontal, User, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'

export interface Application {
  id: string
  status: string
  created_at: string
  jobs: { id: string; title: string }
  users: { first_name: string; last_name: string; email: string }
  assessments?: Array<{ ai_total_score?: number | null; status: string; created_at: string }>
  // Add other fields that might be used
  job_id?: string
  candidate_id?: string
  tenant_id?: string
}

export interface ApplicationsTableProps {
  applications: Application[]
  totalCount: number
  currentPage: number
  totalPages: number
  currentSort: string
}

const STAGE_COLORS = {
  applied: 'bg-blue-100 text-blue-800',
  assessment_submitted: 'bg-yellow-100 text-yellow-800',
  ai_reviewed: 'bg-purple-100 text-purple-800',
  shortlisted: 'bg-green-100 text-green-800',
  manual_review: 'bg-orange-100 text-orange-800',
  paid_assignment: 'bg-indigo-100 text-indigo-800',
  hired: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
} as const

const STAGE_LABELS = {
  applied: 'Applied',
  assessment_submitted: 'Assessment Submitted',
  ai_reviewed: 'AI Reviewed',
  shortlisted: 'Shortlisted',
  manual_review: 'Manual Review',
  paid_assignment: 'Paid Assignment',
  hired: 'Hired',
  rejected: 'Rejected',
} as const

type StageKey = keyof typeof STAGE_COLORS

export function ApplicationsTable({
  applications,
  totalCount,
  currentPage,
  totalPages,
  currentSort
}: ApplicationsTableProps): JSX.Element {
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])

  const updateSort = (field: string): void => {
    const [currentField, currentOrder] = currentSort.split('.')
    const newOrder = currentField === field && currentOrder === 'asc' ? 'desc' : 'asc'
    const url = new URL(window.location.href)
    url.searchParams.set('sort', `${field}.${newOrder}`)
    window.location.href = url.toString()
  }

  const updatePage = (page: number): void => {
    const url = new URL(window.location.href)
    url.searchParams.set('page', page.toString())
    window.location.href = url.toString()
  }

  const getAIScore = (application: Application): number | null => {
    const assessment = application.assessments?.[0]
    if (!assessment || assessment.ai_total_score == null) return null
    return assessment.ai_total_score
  }

  const toggleSelection = (applicationId: string): void => {
    setSelectedApplications(prev => 
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    )
  }

  const toggleAllSelection = (): void => {
    setSelectedApplications(prev => 
      prev.length === applications.length 
        ? []
        : applications.map(app => app.id)
    )
  }

  const getStageBadgeClassName = (stage: string): string => {
    return STAGE_COLORS[stage as StageKey] || 'bg-gray-100 text-gray-800'
  }

  const getStageLabel = (stage: string): string => {
    return STAGE_LABELS[stage as StageKey] || stage
  }

  const isAllSelected = (): boolean => {
    return selectedApplications.length === applications.length && applications.length > 0
  }

  const getColorForScore = (score: number): string => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const formatApplicationDate = (dateString: string): string => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid date'
    }
  }

  const getPaginationStart = (): number => {
    return (currentPage - 1) * 20 + 1
  }

  const getPaginationEnd = (): number => {
    return Math.min(currentPage * 20, totalCount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications ({totalCount})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected()}
                    onChange={toggleAllSelection}
                    className="rounded border-gray-300"
                    aria-label="Select all applications"
                  />
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => updateSort('first_name')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Candidate
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => updateSort('job_id')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Position
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => updateSort('stage')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Stage
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>AI Score</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => updateSort('created_at')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Applied
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => {
                const aiScore = getAIScore(application)
                const isSelected = selectedApplications.includes(application.id)
                
                return (
                  <TableRow 
                    key={application.id}
                    className={isSelected ? 'bg-muted/50' : ''}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(application.id)}
                        className="rounded border-gray-300"
                        aria-label={`Select ${application.users.first_name} ${application.users.last_name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {application.users.first_name} {application.users.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {application.users.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{application.jobs.title}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStageBadgeClassName(application.status)}>
                        {getStageLabel(application.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {aiScore !== null ? (
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getColorForScore(aiScore)}`} />
                          <span className="font-medium">{aiScore}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatApplicationDate(application.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/applications/${application.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Move to Shortlist
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {getPaginationStart()} to {getPaginationEnd()} of {totalCount} applications
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updatePage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updatePage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
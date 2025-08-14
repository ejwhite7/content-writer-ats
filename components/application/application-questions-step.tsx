'use client'

import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { 
  MessageSquare, 
  DollarSign, 
  Calendar as CalendarIcon, 
  Briefcase, 
  Languages, 
  Plus,
  X,
  Star
} from 'lucide-react'
import { Job } from '@/types/database'

interface ApplicationQuestionsStepProps {
  form: UseFormReturn<any>
  job: Job
}

const COMPENSATION_FREQUENCIES = [
  { value: 'per_word', label: 'Per Word' },
  { value: 'per_article', label: 'Per Article' },
  { value: 'per_hour', label: 'Per Hour' },
  { value: 'per_project', label: 'Per Project' },
  { value: 'monthly', label: 'Monthly' },
]

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Chinese',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
  'Russian',
]

const PROFICIENCY_LEVELS = [
  { value: 'basic', label: 'Basic' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'fluent', label: 'Fluent' },
  { value: 'native', label: 'Native' },
]

const SPECIALTIES = [
  'Blog Writing',
  'Technical Writing',
  'Content Marketing',
  'SEO Writing',
  'Copywriting',
  'Social Media',
  'Email Marketing',
  'Product Descriptions',
  'Press Releases',
  'White Papers',
  'Case Studies',
  'Academic Writing',
  'Creative Writing',
  'Script Writing',
  'Grant Writing',
]

export function ApplicationQuestionsStep({ form, job }: ApplicationQuestionsStepProps) {
  const [newLanguage, setNewLanguage] = useState('')
  const [newSpecialty, setNewSpecialty] = useState('')

  const languages = form.watch('languages') || []
  const specialties = form.watch('specialties') || []

  const addLanguage = (language: string, proficiency: string) => {
    if (language && proficiency) {
      const currentLanguages = form.getValues('languages') || []
      const exists = currentLanguages.find((l: any) => l.language === language)
      
      if (!exists) {
        form.setValue('languages', [...currentLanguages, { language, proficiency }])
      }
    }
  }

  const removeLanguage = (index: number) => {
    const currentLanguages = form.getValues('languages') || []
    form.setValue('languages', currentLanguages.filter((_: any, i: number) => i !== index))
  }

  const addSpecialty = (specialty: string) => {
    if (specialty) {
      const currentSpecialties = form.getValues('specialties') || []
      if (!currentSpecialties.includes(specialty)) {
        form.setValue('specialties', [...currentSpecialties, specialty])
      }
      setNewSpecialty('')
    }
  }

  const removeSpecialty = (specialty: string) => {
    const currentSpecialties = form.getValues('specialties') || []
    form.setValue('specialties', currentSpecialties.filter((s: any) => s !== specialty))
  }

  return (
    <div className="space-y-6">
      {/* Cover Letter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Cover Letter
          </CardTitle>
          <CardDescription>
            Tell us why you're interested in this position and what makes you a great fit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="coverLetter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Letter *</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Dear Hiring Manager,\n\nI am excited to apply for the position of..." 
                    {...field}
                    className="min-h-[200px] resize-none"
                  />
                </FormControl>
                <FormMessage />
                <div className="text-sm text-muted-foreground mt-2">
                  Minimum 50 characters. Current: {field.value?.length || 0}
                </div>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Compensation & Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Compensation & Availability
          </CardTitle>
          <CardDescription>
            Share your compensation expectations and availability.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="desiredCompensation.amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Desired Compensation *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="desiredCompensation.frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Frequency *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COMPENSATION_FREQUENCIES.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="availabilityDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Start Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-11 justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="yearsExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Years of Experience *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Languages
          </CardTitle>
          <CardDescription>
            What languages do you speak and write fluently?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Language */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Select value={newLanguage} onValueChange={setNewLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.filter(
                  lang => !languages.find((l: any) => l.language === lang)
                ).map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              onValueChange={(proficiency) => {
                if (newLanguage && proficiency) {
                  addLanguage(newLanguage, proficiency)
                  setNewLanguage('')
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Proficiency" />
              </SelectTrigger>
              <SelectContent>
                {PROFICIENCY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // This will be handled by the Select onChange above
              }}
              disabled={!newLanguage}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          
          {/* Language List */}
          {languages.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Your Languages:</h4>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang: any, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    {lang.language} ({lang.proficiency})
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => removeLanguage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Specialties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Writing Specialties
          </CardTitle>
          <CardDescription>
            What types of content do you specialize in?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Predefined Specialties */}
          <div>
            <h4 className="text-sm font-medium mb-3">Select your specialties:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SPECIALTIES.map((specialty) => (
                <Button
                  key={specialty}
                  type="button"
                  variant={specialties.includes(specialty) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (specialties.includes(specialty)) {
                      removeSpecialty(specialty)
                    } else {
                      addSpecialty(specialty)
                    }
                  }}
                  className="justify-start"
                >
                  {specialty}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Custom Specialty */}
          <div>
            <h4 className="text-sm font-medium mb-2">Add custom specialty:</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Enter a specialty"
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSpecialty(newSpecialty)
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addSpecialty(newSpecialty)}
                disabled={!newSpecialty}
              >
                Add
              </Button>
            </div>
          </div>
          
          {/* Selected Specialties */}
          {specialties.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Selected specialties:</h4>
              <div className="flex flex-wrap gap-2">
                {specialties.map((specialty: any) => (
                  <Badge
                    key={specialty}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    {specialty}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => removeSpecialty(specialty)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
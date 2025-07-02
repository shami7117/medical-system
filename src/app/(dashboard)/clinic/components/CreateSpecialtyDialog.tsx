// components/CreateSpecialtyDialog.tsx
'use client'

import { useState } from 'react'
import { useCreateSpecialty } from '@/hooks/useSpecialties'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'

interface CreateSpecialtyDialogProps {
  hospitalId: string
}

export function CreateSpecialtyDialog({ hospitalId }: CreateSpecialtyDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const createSpecialty = useCreateSpecialty(hospitalId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      return
    }

    try {
      await createSpecialty.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      })
      
      // Reset form and close dialog
      setFormData({ name: '', description: '' })
      setOpen(false)
    } catch (error) {
      // Error handling is done in the hook
      console.error('Failed to create specialty:', error)
    }
  }

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Specialty
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Specialty</DialogTitle>
            <DialogDescription>
              Add a new medical specialty to your hospital.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange('name')}
                placeholder="e.g., Cardiology"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange('description')}
                placeholder="Brief description of the specialty..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={createSpecialty.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.name.trim() || createSpecialty.isPending}
            >
              {createSpecialty.isPending ? 'Creating...' : 'Create Specialty'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
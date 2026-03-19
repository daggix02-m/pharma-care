"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  Building2,
  Users,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/ui"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

// Animated wrapper component
const AnimatedWrapper = ({ children, className, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    >
      {children}
    </div>
  )
}

// Main Component
export function PharmacyManagement({
  pharmacies = [],
  loading = false,
  error = null,
  onRetry,
  onAddPharmacy,
  onEditPharmacy,
  onDeletePharmacy,
}) {
  const [expandedPharmacies, setExpandedPharmacies] = useState(new Set())
  const [showAddPharmacyDialog, setShowAddPharmacyDialog] = useState(false)
  const [showEditPharmacyDialog, setShowEditPharmacyDialog] = useState(false)
  const [showDeletePharmacyDialog, setShowDeletePharmacyDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({})

  const togglePharmacy = (pharmacyId) => {
    setExpandedPharmacies((prev) => {
      const newSet = new Set(prev)
      newSet.has(pharmacyId) ? newSet.delete(pharmacyId) : newSet.add(pharmacyId)
      return newSet
    })
  }

  const handleAddPharmacy = () => {
    if (onAddPharmacy) {
      onAddPharmacy(formData)
    } else {
      toast.error('Adding pharmacies is not available for admin role. Please contact a manager.')
    }
    setShowAddPharmacyDialog(false)
    setFormData({})
  }

  const handleEditPharmacy = () => {
    if (onEditPharmacy) {
      onEditPharmacy(selectedItem.id, formData)
    } else {
      toast.error('Updating pharmacies is not available for admin role. Please contact a manager.')
    }
    setShowEditPharmacyDialog(false)
    setSelectedItem(null)
    setFormData({})
  }

  const handleDeletePharmacy = () => {
    if (onDeletePharmacy) {
      onDeletePharmacy(selectedItem.id)
    } else {
      toast.error('Deleting pharmacies is not available for admin role. Please contact a manager.')
    }
    setShowDeletePharmacyDialog(false)
    setSelectedItem(null)
  }

  const openEditPharmacyDialog = (pharmacy) => {
    setSelectedItem(pharmacy)
    setFormData({
      name: pharmacy.name,
      address: pharmacy.address,
      phone: pharmacy.phone,
      email: pharmacy.email,
    })
    setShowEditPharmacyDialog(true)
  }

  const openDeletePharmacyDialog = (pharmacy) => {
    setSelectedItem(pharmacy)
    setShowDeletePharmacyDialog(true)
  }

  // Loading state
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4">
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary/20 rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading pharmacies...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4">
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold">Error Loading Pharmacies</h3>
          <p className="text-muted-foreground text-center max-w-md">{error}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Empty state
  if (!loading && pharmacies.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4">
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Pharmacies Found</h3>
          <p className="text-muted-foreground text-center max-w-md">
            There are no pharmacies configured in the system. Contact your administrator or add a pharmacy to get started.
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Main list view
  return (
    <>
      <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
        <AnimatedWrapper>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Pharmacy Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage pharmacies and staff
              </p>
            </div>
            <Button onClick={() => setShowAddPharmacyDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Pharmacy
            </Button>
          </div>
        </AnimatedWrapper>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              {pharmacies.map((pharmacy, index) => {
                const isExpanded = expandedPharmacies.has(pharmacy.id)
                const managers = pharmacy.staff?.filter((s) => s.role === "Manager") || []
                const employees = pharmacy.staff?.filter((s) => s.role === "Employee") || []

                return (
                  <AnimatedWrapper key={pharmacy.id || `pharmacy-${index}`} delay={index * 100}>
                    <div className="border rounded-lg overflow-hidden">
                      <div
                        className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => togglePharmacy(pharmacy.id)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className={cn(
                              "transition-transform duration-200",
                              isExpanded ? "rotate-90" : "rotate-0"
                            )}
                          >
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <Building2 className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-semibold">{pharmacy.name}</h4>
                            <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {pharmacy.address}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {pharmacy.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">
                            <Users className="h-3 w-3 mr-1" />
                            {pharmacy.staff?.length || 0} Staff
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditPharmacyDialog(pharmacy)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              openDeletePharmacyDialog(pharmacy)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div
                          className={cn(
                            "overflow-hidden transition-all duration-300 ease-in-out",
                            isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                          )}
                        >
                          <div className="p-6 space-y-6">
                            {managers.length > 0 && (
                              <div>
                                <h5 className="font-semibold mb-3 flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  Managers
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {managers.map((staff, index) => (
                                    <StaffCard key={staff.id || `manager-${index}`} staff={staff} />
                                  ))}
                                </div>
                              </div>
                            )}

                            {employees.length > 0 && (
                              <div>
                                <h5 className="font-semibold mb-3 flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  Employees
                                </h5>
                                <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Join Date</TableHead>
                                        <TableHead className="text-right">
                                          Actions
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {employees.map((staff, index) => (
                                        <TableRow key={staff.id || `employee-${index}`}>
                                          <TableCell>
                                            <div className="flex items-center gap-3">
                                              <Avatar className="h-8 w-8">
                                                <AvatarImage
                                                  src={staff.avatarUrl}
                                                  alt={staff.name}
                                                />
                                                <AvatarFallback>
                                                  {staff.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                                </AvatarFallback>
                                              </Avatar>
                                              <span className="font-medium">
                                                {staff.name}
                                              </span>
                                            </div>
                                          </TableCell>
                                          <TableCell>{staff.email}</TableCell>
                                          <TableCell>{staff.phone}</TableCell>
                                          <TableCell>{staff.joinDate}</TableCell>
                                          <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                              <MoreVertical className="h-4 w-4" />
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}

                            {managers.length === 0 && employees.length === 0 && (
                              <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Staff Assigned</h3>
                                <p className="text-muted-foreground max-w-md">
                                  This pharmacy has no staff members assigned yet.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </AnimatedWrapper>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Pharmacy Dialog */}
      <Dialog open={showAddPharmacyDialog} onOpenChange={setShowAddPharmacyDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Pharmacy</DialogTitle>
            <DialogDescription>
              Enter the details for the new pharmacy. This action is not available for admin role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pharmacy-name">Pharmacy Name</Label>
              <Input
                id="pharmacy-name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter pharmacy name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pharmacy-address">Address</Label>
              <Textarea
                id="pharmacy-address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter pharmacy address"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pharmacy-phone">Phone</Label>
              <Input
                id="pharmacy-phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pharmacy-email">Email</Label>
              <Input
                id="pharmacy-email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPharmacyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPharmacy}>
              <Plus className="h-4 w-4 mr-2" />
              Add Pharmacy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Pharmacy Dialog */}
      <Dialog open={showEditPharmacyDialog} onOpenChange={setShowEditPharmacyDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Pharmacy</DialogTitle>
            <DialogDescription>
              Update the pharmacy details. This action is not available for admin role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-pharmacy-name">Pharmacy Name</Label>
              <Input
                id="edit-pharmacy-name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter pharmacy name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-pharmacy-address">Address</Label>
              <Textarea
                id="edit-pharmacy-address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter pharmacy address"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-pharmacy-phone">Phone</Label>
              <Input
                id="edit-pharmacy-phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-pharmacy-email">Email</Label>
              <Input
                id="edit-pharmacy-email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditPharmacyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPharmacy}>
              <Edit className="h-4 w-4 mr-2" />
              Update Pharmacy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Pharmacy Dialog */}
      <Dialog open={showDeletePharmacyDialog} onOpenChange={setShowDeletePharmacyDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Pharmacy</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedItem?.name}&quot;? This action cannot be undone. This action is not available for admin role.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-4 py-4 bg-destructive/10 rounded-lg p-4">
            <AlertCircle className="h-8 w-8 text-destructive shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Warning</p>
              <p className="text-muted-foreground">
                This will permanently delete the pharmacy and all its staff data.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeletePharmacyDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePharmacy}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Pharmacy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function StaffCard({ staff }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={staff.avatarUrl} alt={staff.name} />
            <AvatarFallback>
              {staff.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h6 className="font-semibold truncate">{staff.name}</h6>
                <Badge variant="outline" className="mt-1">
                  {staff.role}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span className="truncate">{staff.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <span>{staff.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Joined {staff.joinDate}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PharmacyManagement

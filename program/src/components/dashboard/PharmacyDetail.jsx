import React from 'react';
import { Building2, MapPin, Phone, Mail, User, Users, Calendar, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export function PharmacyDetail({ pharmacy, loading }) {
  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!pharmacy) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Pharmacy Selected</h3>
          <p className="text-muted-foreground max-w-md">
            Select a pharmacy from the pharmacy details to view its information.
          </p>
        </CardContent>
      </Card>
    );
  }

  const manager = pharmacy.manager || pharmacy.staff?.find(s => s.role === 'Manager');
  const staffCount = pharmacy.staff?.length || 0;
  const managerCount = pharmacy.staff?.filter(s => s.role === 'Manager').length || 0;

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              {pharmacy.name}
            </CardTitle>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {pharmacy.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {pharmacy.address}
                </div>
              )}
              {pharmacy.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {pharmacy.phone}
                </div>
              )}
              {pharmacy.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {pharmacy.email}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" title="Edit Pharmacy">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Staff Summary */}
        <div>
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Staff Overview
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Staff</div>
              <div className="text-2xl font-bold">{staffCount}</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Managers</div>
              <div className="text-2xl font-bold">{managerCount}</div>
            </div>
          </div>
        </div>

        {/* Pharmacy Manager */}
        {manager && (
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Pharmacy Manager
            </h4>
            <div className="flex items-start gap-4 bg-muted/30 rounded-lg p-4">
              <Avatar className="h-12 w-12">
                {manager.avatarUrl ? (
                  <AvatarImage src={manager.avatarUrl} alt={manager.name} />
                ) : (
                  <AvatarFallback>
                    {manager.name?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold text-base">{manager.name}</div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {manager.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{manager.email}</span>
                    </div>
                  )}
                  {manager.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{manager.phone}</span>
                    </div>
                  )}
                  {manager.joinDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>Joined {manager.joinDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Staff List */}
        {pharmacy.staff && pharmacy.staff.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Staff Members
            </h4>
            <div className="space-y-2">
              {pharmacy.staff.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-start gap-4 bg-muted/30 rounded-lg p-4"
                >
                  <Avatar className="h-10 w-10">
                    {staff.avatarUrl ? (
                      <AvatarImage src={staff.avatarUrl} alt={staff.name} />
                    ) : (
                      <AvatarFallback>
                        {staff.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold">{staff.name}</div>
                        <Badge variant="outline" className="mt-1">
                          {staff.role}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {staff.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{staff.email}</span>
                        </div>
                      )}
                      {staff.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{staff.phone}</span>
                        </div>
                      )}
                      {staff.joinDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Joined {staff.joinDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty Staff State */}
        {(!pharmacy.staff || pharmacy.staff.length === 0) && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Staff Assigned</h3>
            <p className="text-muted-foreground max-w-md">
              This pharmacy has no staff members assigned yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Check, X, Trash2, MessageSquare, Clock, User, Building } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className='flex gap-0.5'>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-muted text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

export function TestimonialsManager() {
  const { sessionToken } = useAuth();
  const [selectedTestimonial, setSelectedTestimonial] = useState<any>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const testimonials = useQuery(
    api.admin.testimonials.getTestimonials,
    sessionToken
      ? { sessionToken, status: statusFilter === 'all' ? undefined : statusFilter }
      : 'skip'
  );
  const stats = useQuery(
    api.admin.testimonials.getTestimonialStats,
    sessionToken ? { sessionToken } : 'skip'
  );

  const approveTestimonial = useMutation(api.admin.testimonials.approveTestimonial);
  const rejectTestimonial = useMutation(api.admin.testimonials.rejectTestimonial);
  const deleteTestimonial = useMutation(api.admin.testimonials.deleteTestimonial);

  const handleApprove = async (testimonialId: string) => {
    try {
      await approveTestimonial({ testimonialId });
      toast.success('Testimonial approved successfully');
    } catch (error) {
      toast.error('Failed to approve testimonial');
    }
  };

  const handleReject = async () => {
    if (!selectedTestimonial || !rejectReason.trim()) return;
    try {
      await rejectTestimonial({
        testimonialId: selectedTestimonial._id,
        reason: rejectReason,
      });
      toast.success('Testimonial rejected');
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedTestimonial(null);
    } catch (error) {
      toast.error('Failed to reject testimonial');
    }
  };

  const handleDelete = async (testimonialId: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await deleteTestimonial({ testimonialId });
      toast.success('Testimonial deleted');
    } catch (error) {
      toast.error('Failed to delete testimonial');
    }
  };

  if (testimonials === undefined || stats === undefined) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-10 w-48' />
        <div className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className='h-32' />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Testimonials</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='approved'>Approved</SelectItem>
              <SelectItem value='rejected'>Rejected</SelectItem>
            </SelectContent>
          </Select>
          {stats.pending > 0 && (
            <Badge variant='secondary' className='bg-amber-100 text-amber-800'>
              <Clock className='h-3 w-3 mr-1' />
              {stats.pending} pending
            </Badge>
          )}
        </div>
      </div>

      <div className='space-y-4'>
        {testimonials.length === 0 ? (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-12'>
              <MessageSquare className='h-12 w-12 text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No Testimonials</h3>
              <p className='text-muted-foreground text-center max-w-md'>
                No testimonials found matching the selected filter.
              </p>
            </CardContent>
          </Card>
        ) : (
          testimonials.map((testimonial) => (
            <Card key={testimonial._id}>
              <CardContent className='p-6'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-start gap-4'>
                    {/* Profile Photo */}
                    <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0'>
                      {testimonial.profilePhotoUrl ? (
                        <img
                          src={testimonial.profilePhotoUrl}
                          alt={testimonial.ownerName}
                          className='h-full w-full object-cover'
                        />
                      ) : (
                        <User className='h-6 w-6 text-primary' />
                      )}
                    </div>

                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold'>{testimonial.ownerName}</span>
                        <span className='text-muted-foreground'>•</span>
                        <span className='text-sm text-muted-foreground flex items-center gap-1'>
                          <Building className='h-3 w-3' />
                          {testimonial.pharmacyName}
                        </span>
                      </div>

                      <div className='flex items-center gap-2'>
                        <StarRating rating={testimonial.starRating} />
                        <Badge
                          variant={
                            testimonial.status === 'approved'
                              ? 'default'
                              : testimonial.status === 'pending'
                                ? 'secondary'
                                : 'destructive'
                          }
                          className='text-xs'
                        >
                          {testimonial.status}
                        </Badge>
                      </div>

                      <p className='text-sm text-muted-foreground mt-2 line-clamp-2'>
                        "{testimonial.content}"
                      </p>

                      <p className='text-xs text-muted-foreground'>
                        Submitted {new Date(testimonial.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex items-center gap-2'>
                    {testimonial.status === 'pending' && (
                      <>
                        <Button
                          size='sm'
                          variant='default'
                          className='h-8 w-8 p-0'
                          onClick={() => handleApprove(testimonial._id)}
                        >
                          <Check className='h-4 w-4' />
                        </Button>
                        <Button
                          size='sm'
                          variant='destructive'
                          className='h-8 w-8 p-0'
                          onClick={() => {
                            setSelectedTestimonial(testimonial);
                            setRejectDialogOpen(true);
                          }}
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </>
                    )}
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-8 w-8 p-0 text-destructive'
                      onClick={() => handleDelete(testimonial._id)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Testimonial</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this testimonial. The owner will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='reason'>Reason for rejection</Label>
              <Textarea
                id='reason'
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder='e.g., Contains inappropriate content...'
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleReject} disabled={!rejectReason.trim()}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TestimonialsManager;

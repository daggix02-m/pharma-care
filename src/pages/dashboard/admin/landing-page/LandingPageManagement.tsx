import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Layout, MessageSquare, Eye, Check, Star, Clock } from 'lucide-react';
import { toast } from 'sonner';
import ContentEditor from './ContentEditor';
import TestimonialsManager from './TestimonialsManager';
import SectionVisibility from './SectionVisibility';
import { useAuth } from '@/contexts/AuthContext';

export function LandingPageManagement() {
  const { sessionToken } = useAuth();
  const [activeTab, setActiveTab] = useState('content');
  const landingPageContent = useQuery(
    api.admin.landingPage.getLandingPageContentAdmin,
    sessionToken ? { sessionToken } : 'skip'
  );
  const testimonialStats = useQuery(
    api.admin.testimonials.getTestimonialStats,
    sessionToken ? { sessionToken } : 'skip'
  );
  const initializeContent = useMutation(api.admin.landingPage.initializeLandingPageContent);

  const handleInitialize = async () => {
    try {
      await initializeContent({});
      toast.success('Landing page content initialized successfully');
    } catch (error) {
      toast.error('Failed to initialize content');
    }
  };

  if (landingPageContent === undefined || testimonialStats === undefined) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-10 w-32' />
        </div>
        <div className='grid gap-4 md:grid-cols-4'>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className='h-32' />
          ))}
        </div>
        <Skeleton className='h-96' />
      </div>
    );
  }

  const sections = landingPageContent?.sections || [];
  const content = landingPageContent?.content || [];

  // Check if content exists
  const hasContent = content.length > 0;

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-display font-bold tracking-tight text-foreground'>
            Landing Page Management
          </h2>
          <p className='text-sm text-muted-foreground mt-1'>
            Manage content, testimonials, and analytics for the public landing page
          </p>
        </div>
        {!hasContent && (
          <Button onClick={handleInitialize} className='gap-2'>
            <Check className='h-4 w-4' />
            Initialize Content
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <Layout className='h-4 w-4' />
              Active Sections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {sections.filter((s) => s.isEnabled).length} / {sections.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <MessageSquare className='h-4 w-4' />
              Total Testimonials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{testimonialStats?.total || 0}</div>
            <div className='flex gap-2 mt-2'>
              <Badge variant='secondary' className='text-xs'>
                {testimonialStats?.pending || 0} Pending
              </Badge>
              <Badge variant='default' className='text-xs'>
                {testimonialStats?.approved || 0} Approved
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <Star className='h-4 w-4' />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {testimonialStats?.avgRating?.toFixed(1) || '0.0'}
              <span className='text-sm font-normal text-muted-foreground ml-1'>/ 5.0</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <Clock className='h-4 w-4' />
              Content Versions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {content.reduce((sum, c) => sum + (c.version || 1), 0)}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>Total edits made</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-3 lg:w-[400px]'>
          <TabsTrigger value='content' className='gap-2'>
            <Layout className='h-4 w-4' />
            Content
          </TabsTrigger>
          <TabsTrigger value='testimonials' className='gap-2'>
            <MessageSquare className='h-4 w-4' />
            Testimonials
            {testimonialStats?.pending > 0 && (
              <Badge
                variant='destructive'
                className='ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]'
              >
                {testimonialStats.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value='sections' className='gap-2'>
            <Eye className='h-4 w-4' />
            Sections
          </TabsTrigger>
        </TabsList>

        <TabsContent value='content' className='mt-6'>
          {hasContent ? (
            <ContentEditor content={content} />
          ) : (
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-12'>
                <Layout className='h-12 w-12 text-muted-foreground mb-4' />
                <h3 className='text-lg font-semibold mb-2'>No Content Found</h3>
                <p className='text-muted-foreground text-center max-w-md mb-4'>
                  Initialize the landing page with default content to get started with content
                  management.
                </p>
                <Button onClick={handleInitialize}>Initialize Default Content</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='testimonials' className='mt-6'>
          <TestimonialsManager />
        </TabsContent>

        <TabsContent value='sections' className='mt-6'>
          <SectionVisibility sections={sections} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LandingPageManagement;

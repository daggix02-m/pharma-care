import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Eye,
  EyeOff,
  Save,
  Layout,
  BarChart3,
  MessageSquare,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface Section {
  _id: string;
  sectionId: string;
  name: string;
  displayName: string;
  description?: string;
  isEnabled: boolean;
  displayOrder: number;
  analyticsEnabled: boolean;
}

interface SectionVisibilityProps {
  sections: Section[];
}

export function SectionVisibility({ sections }: SectionVisibilityProps) {
  const [localSections, setLocalSections] = useState<Section[]>(
    [...sections].sort((a, b) => a.displayOrder - b.displayOrder)
  );
  const [hasChanges, setHasChanges] = useState(false);

  const toggleSection = useMutation(api.admin.landingPage.toggleSectionVisibility);
  const reorderSections = useMutation(api.admin.landingPage.reorderSections);

  const handleToggle = async (sectionId: string, currentValue: boolean) => {
    try {
      await toggleSection({ sectionId, isEnabled: !currentValue });
      setLocalSections(
        localSections.map((s) =>
          s.sectionId === sectionId ? { ...s, isEnabled: !currentValue } : s
        )
      );
      toast.success('Section visibility updated');
    } catch (error) {
      toast.error('Failed to update section');
    }
  };

  const handleReorder = async (orderedIds: string[]) => {
    try {
      await reorderSections({ orderedIds });
      const reordered = orderedIds
        .map((id) => localSections.find((s) => s.sectionId === id))
        .filter(Boolean) as Section[];
      setLocalSections(reordered.map((s, index) => ({ ...s, displayOrder: index + 1 })));
      setHasChanges(false);
      toast.success('Section order updated');
    } catch (error) {
      toast.error('Failed to reorder sections');
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === localSections.length - 1) return;

    const items = [...localSections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    setLocalSections(items);
    setHasChanges(true);
  };

  const saveOrder = () => {
    const orderedIds = localSections.map((s) => s.sectionId);
    handleReorder(orderedIds);
  };

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return <Layout className='h-4 w-4' />;
      case 'testimonials':
        return <MessageSquare className='h-4 w-4' />;
      case 'services':
      case 'features':
        return <BarChart3 className='h-4 w-4' />;
      default:
        return <Layout className='h-4 w-4' />;
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <Eye className='h-5 w-5' />
                Section Visibility
              </CardTitle>
              <CardDescription>
                Toggle sections on/off and reorder them on the landing page
              </CardDescription>
            </div>
            {hasChanges && (
              <Button onClick={saveOrder} size='sm' className='gap-2'>
                <Save className='h-4 w-4' />
                Save Order
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            {localSections.map((section, index) => (
              <div
                key={section.sectionId}
                className='flex items-center justify-between p-4 border rounded-lg bg-background'
              >
                <div className='flex items-center gap-4'>
                  <div className='flex flex-col gap-1'>
                    <button
                      type='button'
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                      className='p-1 hover:bg-muted rounded disabled:opacity-30'
                    >
                      <ArrowUp className='h-3 w-3' />
                    </button>
                    <button
                      type='button'
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === localSections.length - 1}
                      className='p-1 hover:bg-muted rounded disabled:opacity-30'
                    >
                      <ArrowDown className='h-3 w-3' />
                    </button>
                  </div>
                  <div className='p-2 bg-muted rounded-lg'>{getSectionIcon(section.sectionId)}</div>
                  <div>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>{section.displayName}</span>
                      <span className='text-xs text-muted-foreground'>#{section.displayOrder}</span>
                    </div>
                    {section.description && (
                      <p className='text-xs text-muted-foreground'>{section.description}</p>
                    )}
                  </div>
                </div>

                <div className='flex items-center gap-4'>
                  {section.analyticsEnabled && (
                    <Badge variant='secondary' className='text-xs'>
                      <BarChart3 className='h-3 w-3 mr-1' />
                      Analytics
                    </Badge>
                  )}
                  <div className='flex items-center gap-2'>
                    <Switch
                      checked={section.isEnabled}
                      onCheckedChange={() => handleToggle(section.sectionId, section.isEnabled)}
                    />
                    <Label className='text-sm cursor-pointer'>
                      {section.isEnabled ? (
                        <Eye className='h-4 w-4' />
                      ) : (
                        <EyeOff className='h-4 w-4' />
                      )}
                    </Label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SectionVisibility;

import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  List, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Bell,
  RotateCcw,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface DeadlineTrackerProps {
  user: User;
  profile: any;
}

interface Deadline {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  category: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  is_completed: boolean;
  reminder_enabled: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Deadline;
}

const DeadlineTracker: React.FC<DeadlineTrackerProps> = ({ user, profile }) => {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [view, setView] = useState<'calendar' | 'list'>('list');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [newDeadline, setNewDeadline] = useState({
    title: '',
    description: '',
    due_date: '',
    category: 'custom',
    is_recurring: false,
    recurrence_pattern: '',
    reminder_enabled: true
  });

  useEffect(() => {
    fetchDeadlines();
    addPersonalizedDeadlines();
  }, [user.id]);

  const fetchDeadlines = async () => {
    try {
      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setDeadlines(data || []);
    } catch (error) {
      console.error('Error fetching deadlines:', error);
    }
  };

  const getPersonalizedDeadlines = (userRole: string) => {
    const baseDeadlines = [
      {
        title: 'GST Return Filing (GSTR-3B)',
        description: 'Monthly GST return filing',
        category: 'tax',
        days_ahead: 7,
        is_recurring: true,
        recurrence_pattern: 'monthly'
      },
      {
        title: 'ITR Filing Deadline',
        description: 'Annual Income Tax Return filing',
        category: 'tax',
        specific_date: '2024-07-31',
        is_recurring: true,
        recurrence_pattern: 'yearly'
      }
    ];

    const roleSpecificDeadlines = {
      startup: [
        {
          title: 'Annual Compliance (MCA)',
          description: 'File Annual Return and Financial Statements',
          category: 'legal',
          days_ahead: 30,
          is_recurring: true,
          recurrence_pattern: 'yearly'
        },
        {
          title: 'Board Meeting Minutes',
          description: 'Quarterly board meeting and minute filing',
          category: 'legal',
          days_ahead: 14,
          is_recurring: true,
          recurrence_pattern: 'quarterly'
        }
      ],
      freelancer: [
        {
          title: 'Quarterly TDS Return',
          description: 'TDS return filing for professional services',
          category: 'tax',
          days_ahead: 21,
          is_recurring: true,
          recurrence_pattern: 'quarterly'
        },
        {
          title: 'Professional Tax Payment',
          description: 'Monthly professional tax payment',
          category: 'tax',
          days_ahead: 5,
          is_recurring: true,
          recurrence_pattern: 'monthly'
        }
      ],
      small_business: [
        {
          title: 'Audit Report Filing',
          description: 'Annual audit report submission',
          category: 'legal',
          days_ahead: 45,
          is_recurring: true,
          recurrence_pattern: 'yearly'
        },
        {
          title: 'ESI/EPF Compliance',
          description: 'Monthly ESI and EPF compliance filing',
          category: 'legal',
          days_ahead: 10,
          is_recurring: true,
          recurrence_pattern: 'monthly'
        }
      ]
    };

    return [...baseDeadlines, ...(roleSpecificDeadlines[userRole] || [])];
  };

  const addPersonalizedDeadlines = async () => {
    try {
      // Check if user already has deadlines
      const { data: existingDeadlines } = await supabase
        .from('deadlines')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (existingDeadlines && existingDeadlines.length > 0) {
        return; // User already has deadlines, don't add defaults
      }

      const personalizedDeadlines = getPersonalizedDeadlines(profile.role);
      const deadlinesToInsert = personalizedDeadlines.map(deadline => ({
        title: deadline.title,
        description: deadline.description,
        due_date: deadline.specific_date 
          ? new Date(deadline.specific_date).toISOString()
          : new Date(Date.now() + (deadline.days_ahead || 7) * 24 * 60 * 60 * 1000).toISOString(),
        category: deadline.category,
        is_recurring: deadline.is_recurring,
        recurrence_pattern: deadline.recurrence_pattern,
        reminder_enabled: true,
        user_id: user.id
      }));

      const { error } = await supabase
        .from('deadlines')
        .insert(deadlinesToInsert);

      if (error) throw error;
      fetchDeadlines();
    } catch (error) {
      console.error('Error adding personalized deadlines:', error);
    }
  };

  const handleCreateDeadline = async () => {
    try {
      const deadlineData = {
        ...newDeadline,
        user_id: user.id,
        due_date: new Date(newDeadline.due_date).toISOString()
      };

      const { error } = await supabase
        .from('deadlines')
        .insert([deadlineData]);

      if (error) throw error;

      toast({
        title: "Deadline created!",
        description: "Your new deadline has been added successfully."
      });

      setNewDeadline({
        title: '',
        description: '',
        due_date: '',
        category: 'custom',
        is_recurring: false,
        recurrence_pattern: '',
        reminder_enabled: true
      });
      setIsDialogOpen(false);
      fetchDeadlines();
    } catch (error) {
      console.error('Error creating deadline:', error);
      toast({
        title: "Error",
        description: "Failed to create deadline",
        variant: "destructive"
      });
    }
  };

  const handleUpdateDeadline = async () => {
    if (!editingDeadline) return;

    try {
      const { error } = await supabase
        .from('deadlines')
        .update({
          title: newDeadline.title,
          description: newDeadline.description,
          due_date: new Date(newDeadline.due_date).toISOString(),
          category: newDeadline.category,
          is_recurring: newDeadline.is_recurring,
          recurrence_pattern: newDeadline.recurrence_pattern,
          reminder_enabled: newDeadline.reminder_enabled
        })
        .eq('id', editingDeadline.id);

      if (error) throw error;

      toast({
        title: "Deadline updated!",
        description: "Your deadline has been updated successfully."
      });

      setEditingDeadline(null);
      setIsDialogOpen(false);
      fetchDeadlines();
    } catch (error) {
      console.error('Error updating deadline:', error);
      toast({
        title: "Error",
        description: "Failed to update deadline",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDeadline = async (id: string) => {
    try {
      const { error } = await supabase
        .from('deadlines')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Deadline deleted",
        description: "The deadline has been removed."
      });

      fetchDeadlines();
    } catch (error) {
      console.error('Error deleting deadline:', error);
      toast({
        title: "Error",
        description: "Failed to delete deadline",
        variant: "destructive"
      });
    }
  };

  const toggleComplete = async (deadline: Deadline) => {
    try {
      const { error } = await supabase
        .from('deadlines')
        .update({ is_completed: !deadline.is_completed })
        .eq('id', deadline.id);

      if (error) throw error;
      fetchDeadlines();
    } catch (error) {
      console.error('Error updating deadline:', error);
    }
  };

  const openEditDialog = (deadline: Deadline) => {
    setEditingDeadline(deadline);
    setNewDeadline({
      title: deadline.title,
      description: deadline.description || '',
      due_date: deadline.due_date.split('T')[0],
      category: deadline.category,
      is_recurring: deadline.is_recurring,
      recurrence_pattern: deadline.recurrence_pattern || '',
      reminder_enabled: deadline.reminder_enabled
    });
    setIsDialogOpen(true);
  };

  const calendarEvents: CalendarEvent[] = deadlines.map(deadline => ({
    id: deadline.id,
    title: deadline.title,
    start: new Date(deadline.due_date),
    end: new Date(deadline.due_date),
    resource: deadline
  }));

  const upcomingDeadlines = deadlines
    .filter(d => !d.is_completed && new Date(d.due_date) >= new Date())
    .slice(0, 5);

  const getCategoryColor = (category: string) => {
    const colors = {
      tax: 'bg-red-100 text-red-800',
      legal: 'bg-blue-100 text-blue-800',
      contracts: 'bg-green-100 text-green-800',
      custom: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.custom;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Deadline Tracker</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
            <Button
              variant={view === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('calendar')}
            >
              <CalendarIcon className="w-4 h-4 mr-1" />
              Calendar
            </Button>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingDeadline(null);
                setNewDeadline({
                  title: '',
                  description: '',
                  due_date: '',
                  category: 'custom',
                  is_recurring: false,
                  recurrence_pattern: '',
                  reminder_enabled: true
                });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Deadline
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingDeadline ? 'Edit Deadline' : 'Add New Deadline'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newDeadline.title}
                    onChange={(e) => setNewDeadline({...newDeadline, title: e.target.value})}
                    placeholder="e.g., Trademark Renewal"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newDeadline.description}
                    onChange={(e) => setNewDeadline({...newDeadline, description: e.target.value})}
                    placeholder="Additional details..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newDeadline.due_date}
                    onChange={(e) => setNewDeadline({...newDeadline, due_date: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newDeadline.category} onValueChange={(value) => setNewDeadline({...newDeadline, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="tax">Tax</SelectItem>
                      <SelectItem value="contracts">Contracts</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="recurring"
                    checked={newDeadline.is_recurring}
                    onCheckedChange={(checked) => setNewDeadline({...newDeadline, is_recurring: checked})}
                  />
                  <Label htmlFor="recurring">Recurring</Label>
                </div>
                
                {newDeadline.is_recurring && (
                  <div>
                    <Label htmlFor="recurrence">Recurrence Pattern</Label>
                    <Select value={newDeadline.recurrence_pattern} onValueChange={(value) => setNewDeadline({...newDeadline, recurrence_pattern: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pattern" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="reminder"
                    checked={newDeadline.reminder_enabled}
                    onCheckedChange={(checked) => setNewDeadline({...newDeadline, reminder_enabled: checked})}
                  />
                  <Label htmlFor="reminder">Enable Reminders</Label>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={editingDeadline ? handleUpdateDeadline : handleCreateDeadline} className="flex-1">
                    {editingDeadline ? 'Update' : 'Create'} Deadline
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {view === 'list' ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-semibold text-lg">All Deadlines</h4>
            {deadlines.length === 0 ? (
              <Card className="p-12 text-center">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No deadlines yet</h3>
                <p className="text-muted-foreground mb-4">
                  Your personalized deadlines will appear here based on your profile
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {deadlines.map((deadline) => (
                  <Card key={deadline.id} className={`transition-all ${deadline.is_completed ? 'opacity-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium truncate">{deadline.title}</h4>
                            <Badge className={getCategoryColor(deadline.category)}>
                              {deadline.category}
                            </Badge>
                            {deadline.is_recurring && (
                              <Badge variant="outline">
                                <RotateCcw className="w-3 h-3 mr-1" />
                                {deadline.recurrence_pattern}
                              </Badge>
                            )}
                            {deadline.reminder_enabled && (
                              <Bell className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                          {deadline.description && (
                            <p className="text-sm text-muted-foreground mb-2">{deadline.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>Due: {new Date(deadline.due_date).toLocaleDateString()}</span>
                            {!deadline.is_completed && new Date(deadline.due_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                              <Badge variant="destructive" className="ml-2">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Due Soon
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleComplete(deadline)}
                            className={deadline.is_completed ? 'text-green-600' : ''}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(deadline)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDeadline(deadline.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
                ) : (
                  upcomingDeadlines.map((deadline) => (
                    <div key={deadline.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{deadline.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(deadline.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getCategoryColor(deadline.category)} variant="secondary">
                        {deadline.category}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: event.resource.is_completed ? '#10b981' : '#3b82f6',
                  borderColor: event.resource.is_completed ? '#059669' : '#2563eb',
                  color: 'white'
                }
              })}
              onSelectEvent={(event) => openEditDialog(event.resource)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeadlineTracker;
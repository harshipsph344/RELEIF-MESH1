import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { helpRequestAPI } from '@/lib/api';
import { AlertCircle } from 'lucide-react';

export default function HelpRequestForm({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    contact_number: '',
    help_type: '',
    urgency: '',
    description: '',
    location_address: '',
    people_affected: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await helpRequestAPI.create(formData);
      toast({
        title: "Help request submitted",
        description: "Your request has been posted. Help is on the way!",
      });
      setOpen(false);
      setFormData({
        name: '',
        contact_number: '',
        help_type: '',
        urgency: '',
        description: '',
        location_address: '',
        people_affected: 1,
      });
      if (onSuccess) onSuccess(response.data.help_request);
    } catch (error) {
      toast({
        title: "Failed to submit request",
        description: error.response?.data?.error || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Request Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Help</DialogTitle>
          <DialogDescription>
            Submit a request for assistance during the disaster
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_number">Contact Number *</Label>
                <Input
                  id="contact_number"
                  type="tel"
                  value={formData.contact_number}
                  onChange={(e) => handleChange('contact_number', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="help_type">Type of Help Needed *</Label>
                <Select value={formData.help_type} onValueChange={(value) => handleChange('help_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="water">Water</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="rescue">Rescue</SelectItem>
                    <SelectItem value="shelter">Shelter</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level *</Label>
                <Select value={formData.urgency} onValueChange={(value) => handleChange('urgency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="people_affected">Number of People Affected *</Label>
              <Input
                id="people_affected"
                type="number"
                min="1"
                value={formData.people_affected}
                onChange={(e) => handleChange('people_affected', parseInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Situation Description *</Label>
              <Input
                id="description"
                placeholder="Describe your situation and specific needs"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_address">Location Address *</Label>
              <Input
                id="location_address"
                placeholder="Full address with city and state"
                value={formData.location_address}
                onChange={(e) => handleChange('location_address', e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter a complete address for accurate geocoding
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} variant="destructive">
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

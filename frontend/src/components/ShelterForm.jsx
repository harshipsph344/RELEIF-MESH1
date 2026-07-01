import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { shelterAPI } from '@/lib/api';
import { Home } from 'lucide-react';

export default function ShelterForm({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    shelter_name: '',
    contact_person: '',
    contact_number: '',
    location_address: '',
    total_capacity: 0,
    current_occupancy: 0,
    has_food: false,
    has_water: false,
    has_medical: false,
    has_electricity: false,
    has_toilets: false,
    operational_status: 'open',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await shelterAPI.create(formData);
      toast({
        title: "Shelter registered successfully",
        description: "Your shelter has been added to the relief network.",
      });
      setOpen(false);
      setFormData({
        shelter_name: '',
        contact_person: '',
        contact_number: '',
        location_address: '',
        total_capacity: 0,
        current_occupancy: 0,
        has_food: false,
        has_water: false,
        has_medical: false,
        has_electricity: false,
        has_toilets: false,
        operational_status: 'open',
      });
      if (onSuccess) onSuccess(response.data.shelter);
    } catch (error) {
      toast({
        title: "Failed to register shelter",
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
        <Button variant="secondary" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          Register Shelter
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register Relief Shelter</DialogTitle>
          <DialogDescription>
            Add a shelter to provide temporary refuge for displaced people
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="shelter_name">Shelter Name *</Label>
              <Input
                id="shelter_name"
                placeholder="e.g., Community Center Relief Shelter"
                value={formData.shelter_name}
                onChange={(e) => handleChange('shelter_name', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person *</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => handleChange('contact_person', e.target.value)}
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

            <div className="space-y-2">
              <Label htmlFor="location_address">Location Address *</Label>
              <Input
                id="location_address"
                placeholder="Full address with city and state"
                value={formData.location_address}
                onChange={(e) => handleChange('location_address', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_capacity">Total Capacity *</Label>
                <Input
                  id="total_capacity"
                  type="number"
                  min="1"
                  value={formData.total_capacity}
                  onChange={(e) => handleChange('total_capacity', parseInt(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_occupancy">Current Occupancy</Label>
                <Input
                  id="current_occupancy"
                  type="number"
                  min="0"
                  value={formData.current_occupancy}
                  onChange={(e) => handleChange('current_occupancy', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available Facilities</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_food"
                    checked={formData.has_food}
                    onCheckedChange={(checked) => handleChange('has_food', checked)}
                  />
                  <Label htmlFor="has_food" className="font-normal cursor-pointer">Food</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_water"
                    checked={formData.has_water}
                    onCheckedChange={(checked) => handleChange('has_water', checked)}
                  />
                  <Label htmlFor="has_water" className="font-normal cursor-pointer">Water</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_medical"
                    checked={formData.has_medical}
                    onCheckedChange={(checked) => handleChange('has_medical', checked)}
                  />
                  <Label htmlFor="has_medical" className="font-normal cursor-pointer">Medical</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_electricity"
                    checked={formData.has_electricity}
                    onCheckedChange={(checked) => handleChange('has_electricity', checked)}
                  />
                  <Label htmlFor="has_electricity" className="font-normal cursor-pointer">Electricity</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_toilets"
                    checked={formData.has_toilets}
                    onCheckedChange={(checked) => handleChange('has_toilets', checked)}
                  />
                  <Label htmlFor="has_toilets" className="font-normal cursor-pointer">Toilets</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="operational_status">Operational Status *</Label>
              <Select value={formData.operational_status} onValueChange={(value) => handleChange('operational_status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register Shelter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

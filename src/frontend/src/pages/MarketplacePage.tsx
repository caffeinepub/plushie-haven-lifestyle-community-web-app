import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, Plus, Search, Heart, MessageCircle, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

// Mock marketplace listings - will be replaced with backend data
const MOCK_LISTINGS = [
  {
    id: '1',
    title: 'Vintage Teddy Bear',
    description: 'Classic brown teddy bear from the 1980s, excellent condition',
    condition: 'Excellent',
    listingType: 'Trade',
    creator: 'user123',
    image: '/assets/generated/collection-example.dim_600x400.png',
    timestamp: Date.now(),
  },
];

export default function MarketplacePage() {
  const { identity } = useInternetIdentity();
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('');
  const [listingType, setListingType] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const isAuthenticated = !!identity;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be less than 10MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile || !title.trim() || !description.trim() || !condition || !listingType) {
      toast.error('Please fill in all required fields');
      return;
    }

    // This will be implemented once backend is ready
    toast.info('Marketplace feature coming soon! Backend integration in progress.');
    setCreateDialogOpen(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCondition('');
    setListingType('');
    setImageFile(null);
    setImagePreview(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-16 text-center">
        <div className="rounded-3xl bg-white dark:bg-gray-800 p-12 shadow-lg">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-pink-500" />
          <h2 className="text-2xl font-bold mb-2">Marketplace Access</h2>
          <p className="text-muted-foreground">Please log in to browse and create marketplace listings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <img
            src="/assets/generated/marketplace-icon.dim_200x200.png"
            alt="Marketplace"
            className="h-16 w-16 rounded-2xl shadow-md"
          />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Plushie Marketplace
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Trade, gift, or find new homes for your beloved plushies in our safe community marketplace.
        </p>
      </div>

      {/* Search and Create */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search marketplace..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-full"
          />
        </div>
        <Dialog open={createDialogOpen} onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white gap-2">
              <Plus className="h-4 w-4" />
              Create Listing
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                Create Marketplace Listing
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateListing} className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="listing-image">Plushie Photo *</Label>
                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 rounded-full"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="listing-image"
                    className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-pink-300 rounded-2xl cursor-pointer hover:border-pink-400 transition-colors"
                  >
                    <Upload className="h-10 w-10 text-pink-400 mb-2" />
                    <span className="text-sm text-muted-foreground">Click to upload</span>
                  </label>
                )}
                <Input
                  id="listing-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Vintage Teddy Bear"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  className="rounded-2xl"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your plushie..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={4}
                  className="rounded-2xl resize-none"
                />
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Listing Type */}
              <div className="space-y-2">
                <Label htmlFor="listingType">Listing Type *</Label>
                <Select value={listingType} onValueChange={setListingType}>
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trade">Trade</SelectItem>
                    <SelectItem value="gift">Gift</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white"
              >
                Create Listing
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Coming Soon Notice */}
      <Card className="mb-6 rounded-3xl border-2 border-pink-300 bg-gradient-to-br from-pink-50 to-purple-50 dark:border-purple-700 dark:from-pink-900/20 dark:to-purple-900/20">
        <CardContent className="p-6 text-center">
          <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-pink-500" />
          <h3 className="text-lg font-semibold mb-2">Marketplace Coming Soon!</h3>
          <p className="text-sm text-muted-foreground">
            We're working on bringing you a safe and cozy marketplace to trade, gift, and find new homes for your plushies.
            Stay tuned for updates!
          </p>
        </CardContent>
      </Card>

      {/* Listings Grid (Mock Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_LISTINGS.map((listing) => (
          <Card key={listing.id} className="rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <img
              src={listing.image}
              alt={listing.title}
              className="w-full h-48 object-cover"
            />
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{listing.title}</h3>
                <Badge variant="secondary" className="rounded-full">
                  {listing.listingType}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {listing.description}
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="rounded-full">
                  {listing.condition}
                </Badge>
                <Button size="sm" variant="ghost" className="rounded-full gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  Shield,
  Star,
  Award,
  Package,
  Heart,
  Settings,
  Bell,
  CreditCard,
  Truck,
  Lock,
  Plus
} from 'lucide-react';

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    bio: '',
    shippingAddress: {
      street: '',
      city: '',
      province: '',
      zip: '',
      country: ''
    },
    paymentMethod: {
      type: '',
      cardNumber: '',
      expiryDate: '',
      holderName: ''
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone || '',
        bio: user.bio || '',
        shippingAddress: (user.shippingAddress as any) || {
          street: '',
          city: '',
          province: '',
          zip: '',
          country: ''
        },
        paymentMethod: (user.paymentMethod as any) || {
          type: '',
          cardNumber: '',
          expiryDate: '',
          holderName: ''
        }
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('PUT', '/api/auth/user', data);
    },
    onSuccess: () => {
      toast({
        title: "Profilo aggiornato",
        description: "Le tue informazioni sono state salvate con successo.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il profilo.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        phone: user.phone || '',
        bio: user.bio || '',
        shippingAddress: (user.shippingAddress as any) || {
          street: '',
          city: '',
          province: '',
          zip: '',
          country: ''
        },
        paymentMethod: (user.paymentMethod as any) || {
          type: '',
          cardNumber: '',
          expiryDate: '',
          holderName: ''
        }
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Caricamento profilo...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Accesso Richiesto</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Devi effettuare l'accesso per visualizzare il tuo profilo
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Accedi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Il Mio Profilo
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestisci le tue informazioni personali e preferenze
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Informazioni Personali
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback className="text-xl bg-blue-100 dark:bg-blue-900 text-blue-600">
                        {user?.firstName?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Membro da {new Date(user?.createdAt || Date.now()).toLocaleDateString('it-IT')}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        <Star className="w-3 h-3 mr-1" />
                        Gamer Premium
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Completo</Label>
                      <p className="mt-1 text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <p className="mt-1 text-gray-900 dark:text-white">{user?.email}</p>
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefono</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="mt-1"
                          placeholder="+39 123 456 7890"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-white">{formData.phone || 'Non specificato'}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="address">Indirizzo di Spedizione</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-gray-900 dark:text-white">
                          {formData.shippingAddress.street ? 
                            `${formData.shippingAddress.street}, ${formData.shippingAddress.city}` : 
                            'Non specificato'}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddressDialog(true)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Modifica
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Biografia</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        className="mt-1"
                        placeholder="Raccontaci qualcosa di te..."
                        rows={3}
                      />
                    ) : (
                      <p className="mt-1 text-gray-900 dark:text-white">{formData.bio || 'Nessuna biografia disponibile'}</p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" />
                        Salva
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Annulla
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Stats & Quick Actions */}
            <div className="space-y-6">
              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Statistiche
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Ordini</span>
                    </div>
                    <Badge variant="secondary">12</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-600" />
                      <span className="text-sm">Wishlist</span>
                    </div>
                    <Badge variant="secondary">8</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">Recensioni</span>
                    </div>
                    <Badge variant="secondary">5</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Azioni Rapide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    Notifiche
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowPaymentDialog(true)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Metodi di Pagamento
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowAddressDialog(true)}
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Indirizzi di Spedizione
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Shipping Address Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Indirizzo di Spedizione</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="street">Via</Label>
              <Input
                id="street"
                value={formData.shippingAddress.street}
                onChange={(e) => setFormData({
                  ...formData,
                  shippingAddress: { ...formData.shippingAddress, street: e.target.value }
                })}
                placeholder="Via Roma 123"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Città</Label>
                <Input
                  id="city"
                  value={formData.shippingAddress.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    shippingAddress: { ...formData.shippingAddress, city: e.target.value }
                  })}
                  placeholder="Milano"
                />
              </div>
              <div>
                <Label htmlFor="province">Provincia</Label>
                <Input
                  id="province"
                  value={formData.shippingAddress.province}
                  onChange={(e) => setFormData({
                    ...formData,
                    shippingAddress: { ...formData.shippingAddress, province: e.target.value }
                  })}
                  placeholder="MI"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zip">CAP</Label>
                <Input
                  id="zip"
                  value={formData.shippingAddress.zip}
                  onChange={(e) => setFormData({
                    ...formData,
                    shippingAddress: { ...formData.shippingAddress, zip: e.target.value }
                  })}
                  placeholder="20121"
                />
              </div>
              <div>
                <Label htmlFor="country">Paese</Label>
                <Input
                  id="country"
                  value={formData.shippingAddress.country}
                  onChange={(e) => setFormData({
                    ...formData,
                    shippingAddress: { ...formData.shippingAddress, country: e.target.value }
                  })}
                  placeholder="Italia"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowAddressDialog(false)}
              >
                Annulla
              </Button>
              <Button 
                onClick={() => {
                  updateProfileMutation.mutate(formData);
                  setShowAddressDialog(false);
                }}
              >
                Salva Indirizzo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Method Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Metodo di Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-type">Tipo di Pagamento</Label>
              <Select 
                value={formData.paymentMethod.type} 
                onValueChange={(value) => setFormData({
                  ...formData,
                  paymentMethod: { ...formData.paymentMethod, type: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo di pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visa">Visa</SelectItem>
                  <SelectItem value="mastercard">Mastercard</SelectItem>
                  <SelectItem value="amex">American Express</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="card-number">Numero Carta</Label>
              <Input
                id="card-number"
                value={formData.paymentMethod.cardNumber}
                onChange={(e) => setFormData({
                  ...formData,
                  paymentMethod: { ...formData.paymentMethod, cardNumber: e.target.value }
                })}
                placeholder="**** **** **** 1234"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Data di Scadenza</Label>
                <Input
                  id="expiry"
                  value={formData.paymentMethod.expiryDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    paymentMethod: { ...formData.paymentMethod, expiryDate: e.target.value }
                  })}
                  placeholder="MM/AA"
                />
              </div>
              <div>
                <Label htmlFor="holder-name">Nome Intestatario</Label>
                <Input
                  id="holder-name"
                  value={formData.paymentMethod.holderName}
                  onChange={(e) => setFormData({
                    ...formData,
                    paymentMethod: { ...formData.paymentMethod, holderName: e.target.value }
                  })}
                  placeholder="Mario Rossi"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowPaymentDialog(false)}
              >
                Annulla
              </Button>
              <Button 
                onClick={() => {
                  updateProfileMutation.mutate(formData);
                  setShowPaymentDialog(false);
                }}
              >
                Salva Metodo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
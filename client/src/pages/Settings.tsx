import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Eye, 
  Globe, 
  Crown,
  Lock,
  User,
  Download
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Impostazioni salvate",
      description: "Le tue preferenze sono state aggiornate con successo.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Esportazione dati",
      description: "I tuoi dati verranno inviati via email entro 24 ore.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Eliminazione account",
      description: "Contatta il supporto per eliminare il tuo account.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Impostazioni
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gestisci le tue preferenze e impostazioni account
              </p>
            </div>
          </div>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Informazioni Account</span>
                {user?.isAdmin && (
                  <Badge variant="secondary" className="ml-2">
                    <Crown className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Informazioni di base sul tuo account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    value={user?.firstName || ''}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Cognome</Label>
                  <Input
                    id="lastName"
                    value={user?.lastName || ''}
                    disabled
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Per modificare queste informazioni, contatta il supporto.
              </p>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifiche</span>
              </CardTitle>
              <CardDescription>
                Gestisci come ricevere le notifiche
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">✓ Notifiche Email attivate</p>
                <p className="text-sm">✓ Notifiche Push attivate</p>
                <p className="text-sm">✗ SMS disattivate</p>
                <p className="text-sm">✗ Email Marketing disattivate</p>
              </div>
              <Button variant="outline" size="sm">
                Modifica Preferenze
              </Button>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Privacy</span>
              </CardTitle>
              <CardDescription>
                Controlla la privacy e visibilità del tuo account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">✓ Profilo visibile</p>
                <p className="text-sm">✗ Attività nascosta</p>
                <p className="text-sm">✓ Raccolta dati consentita</p>
              </div>
              <Button variant="outline" size="sm">
                Gestisci Privacy
              </Button>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Aspetto</span>
              </CardTitle>
              <CardDescription>
                Personalizza l'aspetto dell'interfaccia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Tema</Label>
                  <span className="text-sm">Chiaro</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">Italiano</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>Dati e Sicurezza</span>
              </CardTitle>
              <CardDescription>
                Gestisci i tuoi dati e la sicurezza dell'account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Esporta Dati</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Scarica una copia dei tuoi dati
                  </p>
                </div>
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Esporta
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-red-600">Elimina Account</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Elimina permanentemente il tuo account
                  </p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Elimina
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline">
              Annulla
            </Button>
            <Button onClick={handleSaveSettings}>
              Salva Impostazioni
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
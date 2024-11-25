import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { t } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const { toast } = useToast();

  const handleDeleteAccount = () => {
    toast({
      title: "Compte supprimé",
      description: "Votre compte a été supprimé avec succès.",
    });
  };

  const handleChangePassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Mot de passe modifié",
      description: "Votre mot de passe a été changé avec succès.",
    });
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Paramètres</h1>
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Compte</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="automation">Automatisation</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Informations du compte</CardTitle>
              <CardDescription>
                Gérez les détails et les préférences de votre compte.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src="/placeholder.svg?height=80&width=80"
                    alt="Photo de profil"
                  />
                  <AvatarFallback>
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <Button>Changer l'avatar</Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input id="name" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Langue</Label>
                <Select>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Sélectionnez une langue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Sauvegarder les modifications</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Apparence</CardTitle>
              <CardDescription>
                Personnalisez l'apparence de l'application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Mode sombre</Label>
                  <p className="text-sm text-muted-foreground">
                    Activez le mode sombre pour une expérience visuelle
                    confortable en faible luminosité.
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="font-size">Taille de la police</Label>
                <Slider
                  id="font-size"
                  min={12}
                  max={24}
                  step={1}
                  defaultValue={[16]}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de notification</CardTitle>
              <CardDescription>
                Gérez la façon dont vous recevez les notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">
                    Notifications par email
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez des notifications par email.
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Notifications push</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez des notifications push sur vos appareils.
                  </p>
                </div>
                <Switch id="push-notifications" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notification-frequency">
                  Fréquence des notifications
                </Label>
                <Select>
                  <SelectTrigger id="notification-frequency">
                    <SelectValue placeholder="Sélectionnez la fréquence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Temps réel</SelectItem>
                    <SelectItem value="hourly">Résumé horaire</SelectItem>
                    <SelectItem value="daily">Résumé quotidien</SelectItem>
                    <SelectItem value="weekly">Résumé hebdomadaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de sécurité</CardTitle>
              <CardDescription>
                Gérez la sécurité et l'accès de votre compte.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Changer le mot de passe</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Changer le mot de passe</DialogTitle>
                    <DialogDescription>
                      Entrez votre mot de passe actuel et votre nouveau mot de
                      passe.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleChangePassword}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor="current-password"
                          className="text-right"
                        >
                          Mot de passe actuel
                        </Label>
                        <Input
                          id="current-password"
                          type="password"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-password" className="text-right">
                          Nouveau mot de passe
                        </Label>
                        <Input
                          id="new-password"
                          type="password"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor="confirm-password"
                          className="text-right"
                        >
                          Confirmer le mot de passe
                        </Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Changer le mot de passe</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor">
                    Authentification à deux facteurs
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Ajoutez une couche de sécurité supplémentaire à votre
                    compte.
                  </p>
                </div>
                <Switch id="two-factor" />
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Supprimer le compte</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Êtes-vous absolument sûr ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action ne peut pas être annulée. Cela supprimera
                      définitivement votre compte et supprimera vos données de
                      nos serveurs.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount}>
                      Continuer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres d'automatisation</CardTitle>
              <CardDescription>
                Configurez les options spécifiques à l'automatisation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="execution-limit">
                  Limite d'exécutions quotidiennes
                </Label>
                <Input id="execution-limit" type="number" placeholder="1000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">Clé API</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Votre clé API"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retry-attempts">Tentatives de réessai</Label>
                <Select>
                  <SelectTrigger id="retry-attempts">
                    <SelectValue placeholder="Sélectionnez le nombre de tentatives" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 tentative</SelectItem>
                    <SelectItem value="3">3 tentatives</SelectItem>
                    <SelectItem value="5">5 tentatives</SelectItem>
                    <SelectItem value="10">10 tentatives</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

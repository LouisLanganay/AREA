import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useFontScale } from "@/context/FontScaleContext";
import { useTheme } from "@/context/ThemeContext";
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
  const { fontScale, setFontScale } = useFontScale();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const { toast } = useToast();
  const [language, setLanguage] = useState(i18n.language);
  const [avatarUrl, setAvatarUrl] = useState(
    "/placeholder.svg?height=80&width=80"
  );

  const fontSizeOptions = [
    { label: "Petit", value: 0.8 },
    { label: "Normal", value: 1 },
    { label: "Grand", value: 1.2 },
    { label: "Très Grand", value: 1.5 },
  ];

  const handleAccountChanges = () => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  };

  const handleFontScaleChange = (value: number) => {
    setFontScale(value);
  };

  const handleDeleteAccount = () => {
    toast({
      title: t("settings.security.delete.confirmation.title"),
      description: t("settings.security.delete.confirmation.description"),
    });
  };

  const handleChangePassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: t("settings.security.password.change"),
      description: t("settings.security.password.changed"),
    });
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">{t("settings.title")}</h1>
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">
            {t("settings.tabs.account")}
          </TabsTrigger>
          <TabsTrigger value="appearance">
            {t("settings.tabs.appearance")}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            {t("settings.tabs.notifications")}
          </TabsTrigger>
          <TabsTrigger value="security">
            {t("settings.tabs.security")}
          </TabsTrigger>
          <TabsTrigger value="automation">
            {t("settings.tabs.automation")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.account.title")}</CardTitle>
              <CardDescription>
                {t("settings.account.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={avatarUrl}
                    alt={t("settings.account.avatar.alt")}
                  />
                  <AvatarFallback>
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>{t("settings.account.avatar.change")}</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        {t("settings.account.avatar.change")}
                      </DialogTitle>
                      <DialogDescription>
                        {t("settings.account.avatar.description")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="avatar" className="text-right">
                          {t("settings.account.avatar.upload")}
                        </Label>
                        <Input
                          id="avatar"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button>{t("settings.account.avatar.save")}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t("settings.account.fields.name")}
                </Label>
                <Input id="name" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  {t("settings.account.fields.email")}
                </Label>
                <Input id="email" type="email" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">
                  {t("settings.account.fields.language")}
                </Label>
                <Select
                  onValueChange={(value) => setLanguage(value)}
                  value={language}
                >
                  <SelectTrigger id="language">
                    <SelectValue
                      placeholder={t("settings.account.languages.placeholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">
                      {t("settings.account.languages.fr")}
                    </SelectItem>
                    <SelectItem value="en">
                      {t("settings.account.languages.en")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAccountChanges}>
                {t("settings.account.save")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.appearance.title")}</CardTitle>
              <CardDescription>
                {t("settings.appearance.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">
                    {t("settings.appearance.darkMode.label")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.appearance.darkMode.description")}
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="font-size">
                  {t("settings.appearance.fontSize.label")}
                </Label>
                <Select
                  value={fontScale.toString()}
                  onValueChange={(value) =>
                    handleFontScaleChange(Number(value))
                  }
                >
                  <SelectTrigger id="font-size">
                    <SelectValue
                      placeholder={t("settings.appearance.fontSize.label")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {fontSizeOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {t("settings.appearance.fontSize.description")} (
                  {Math.round(fontScale * 100)}%)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.notifications.title")}</CardTitle>
              <CardDescription>
                {t("settings.notifications.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">
                    {t("settings.notifications.email.label")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.notifications.email.description")}
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
                  <Label htmlFor="push-notifications">
                    {t("settings.notifications.push.label")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.notifications.push.description")}
                  </p>
                </div>
                <Switch id="push-notifications" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notification-frequency">
                  {t("settings.notifications.frequency.label")}
                </Label>
                <Select>
                  <SelectTrigger id="notification-frequency">
                    <SelectValue
                      placeholder={t(
                        "settings.notifications.frequency.placeholder"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">
                      {t("settings.notifications.frequency.options.realtime")}
                    </SelectItem>
                    <SelectItem value="hourly">
                      {t("settings.notifications.frequency.options.hourly")}
                    </SelectItem>
                    <SelectItem value="daily">
                      {t("settings.notifications.frequency.options.daily")}
                    </SelectItem>
                    <SelectItem value="weekly">
                      {t("settings.notifications.frequency.options.weekly")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.security.title")}</CardTitle>
              <CardDescription>
                {t("settings.security.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>{t("settings.security.password.change")}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {t("settings.security.password.change")}
                    </DialogTitle>
                    <DialogDescription>
                      {t("settings.security.password.description")}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleChangePassword}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor="current-password"
                          className="text-right"
                        >
                          {t("settings.security.password.current")}
                        </Label>
                        <Input
                          id="current-password"
                          type="password"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-password" className="text-right">
                          {t("settings.security.password.new")}
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
                          {t("settings.security.password.confirm")}
                        </Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">
                        {t("settings.security.password.change")}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor">
                    {t("settings.security.twoFactor.label")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.security.twoFactor.description")}
                  </p>
                </div>
                <Switch id="two-factor" />
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    {t("settings.security.delete.label")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("settings.security.delete.confirmation.title")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("settings.security.delete.confirmation.description")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {t("settings.cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount}>
                      {t("settings.confirm")}
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
              <CardTitle>{t("settings.automation.title")}</CardTitle>
              <CardDescription>
                {t("settings.automation.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="execution-limit">
                  {t("settings.automation.executionLimit.label")}
                </Label>
                <Input id="execution-limit" type="number" placeholder="1000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">
                  {t("settings.automation.apiKey.label")}
                </Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder={t("settings.automation.apiKey.label")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retry-attempts">
                  {t("settings.automation.retryAttempts.label")}
                </Label>
                <Select>
                  <SelectTrigger id="retry-attempts">
                    <SelectValue
                      placeholder={t(
                        "settings.automation.retryAttempts.placeholder"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">
                      {t("settings.automation.retryAttempts.options.1")}
                    </SelectItem>
                    <SelectItem value="3">
                      {t("settings.automation.retryAttempts.options.3")}
                    </SelectItem>
                    <SelectItem value="5">
                      {t("settings.automation.retryAttempts.options.5")}
                    </SelectItem>
                    <SelectItem value="10">
                      {t("settings.automation.retryAttempts.options.10")}
                    </SelectItem>
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

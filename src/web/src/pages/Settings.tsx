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
import { useToast } from "@/hooks/use-toast";
import { updateUser } from "@/api/User";
import { useAuth } from "@/auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
  });
  const navigate = useNavigate();
  const { fontScale, setFontScale } = useFontScale();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [language, setLanguage] = useState(i18n.language);
  const [hasChanges, setHasChanges] = useState(false);

  const fontSizeOptions = [
    { label: t("settings.appearance.fontSize.small"), value: 0.8 },
    { label: t("settings.appearance.fontSize.medium"), value: 1 },
    { label: t("settings.appearance.fontSize.large"), value: 1.2 },
    { label: t("settings.appearance.fontSize.xLarge"), value: 1.5 },
  ];

  const handleAccountChanges = async () => {
    if (!user || !token) return;
    try {
      setIsLoading(true);
      await updateUser(token, {
        ...user,
        ...formData
      });

      i18n.changeLanguage(language);
      localStorage.setItem("language", language);

      toast({
        title: t("settings.account.saveSuccess"),
        description: t("settings.account.saveSuccessDescription"),
      });
    } catch (error) {
      toast({
        title: t("settings.account.saveError"),
        description: t("settings.account.saveErrorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const hasFormChanges = value !== (user?.[field as keyof typeof user] || "");
    const hasLanguageChanged = language !== i18n.language;
    setHasChanges(hasFormChanges || hasLanguageChanged);
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">{t("settings.title")}</h1>
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">
            {t("settings.tabs.account")}
          </TabsTrigger>
          <TabsTrigger value="appearance">
            {t("settings.tabs.appearance")}
          </TabsTrigger>
          <TabsTrigger value="security">
            {t("settings.tabs.security")}
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
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t("settings.account.fields.name")}
                </Label>
                <Input
                  id="name"
                  value={formData.displayName}
                  onChange={(e) => handleFormChange("displayName", e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  {t("settings.account.fields.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  placeholder="john@example.com"
                />
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
              <Button
                onClick={handleAccountChanges}
                disabled={isLoading || !hasChanges}
              >
                {isLoading ? t("settings.account.saving") : t("settings.account.save")}
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

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.security.title")}</CardTitle>
              <CardDescription>
                {t("settings.security.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">
                    {t("settings.security.password.label")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.security.password.description")}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    navigate("/forgot-password");
                  }}
                >
                  {t("settings.security.password.change")}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">
                    {t("settings.security.delete.label")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.security.delete.description")}
                  </p>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

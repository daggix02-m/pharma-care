import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function SettingsSection() {
  const { sessionToken } = useAuth();
  const sessionTokenArg = sessionToken || undefined;
  const settings = useQuery(
    api.admin.siteSettings.getSiteSettingsAdmin,
    sessionTokenArg ? { sessionToken: sessionTokenArg } : "skip",
  );
  const updateSettings = useMutation(api.admin.siteSettings.updateSiteSettings);
  const toggleTestMode = useMutation(api.admin.siteSettings.toggleTestMode);
  const sendTestEmail = useMutation(api.admin.siteSettings.sendSiteTestEmail);

  const [formData, setFormData] = useState({
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    resendApiKey: "",
    testMode: true,
  });
  const [initialFormData, setInitialFormData] = useState({
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    testMode: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const hasSavedApiKey = Boolean(settings?.resendApiKey) || apiKeyConfigured;
  const hasPendingApiKey = formData.resendApiKey.trim().length > 0;
  const isDirty =
    hasPendingApiKey ||
    formData.contactEmail !== initialFormData.contactEmail ||
    formData.contactPhone !== initialFormData.contactPhone ||
    formData.contactAddress !== initialFormData.contactAddress ||
    formData.testMode !== initialFormData.testMode;
  const maskedSavedApiKey = useMemo(() => {
    const apiKey = settings?.resendApiKey;
    if (!apiKey) {
      return null;
    }

    if (apiKey.length <= 12) {
      return `${apiKey.slice(0, 3)}****`;
    }

    return `${apiKey.slice(0, 5)}...${apiKey.slice(-4)}`;
  }, [settings?.resendApiKey]);

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "Unexpected error";
  };

  useEffect(() => {
    if (settings) {
      const nextInitial = {
        contactEmail: settings.contactEmail || "daggi.x02@gmail.com",
        contactPhone: settings.contactPhone || "",
        contactAddress: settings.contactAddress || "",
        testMode: settings.testMode ?? true,
      };

      setApiKeyConfigured(Boolean(settings.resendApiKey));
      setFormData({
        contactEmail: nextInitial.contactEmail,
        contactPhone: nextInitial.contactPhone,
        contactAddress: nextInitial.contactAddress,
        resendApiKey: "",
        testMode: nextInitial.testMode,
      });
      setInitialFormData(nextInitial);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!formData.contactEmail) {
      toast.error("Contact email is required");
      return;
    }

    setIsLoading(true);
    try {
      await updateSettings({
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        contactAddress: formData.contactAddress,
        resendApiKey: formData.resendApiKey,
        testMode: formData.testMode,
        sessionToken: sessionTokenArg,
      });
      setFormData((prev) => ({ ...prev, resendApiKey: "" }));
      setInitialFormData({
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        contactAddress: formData.contactAddress,
        testMode: formData.testMode,
      });
      if (hasPendingApiKey) {
        setApiKeyConfigured(true);
      }
      toast.success(
        hasPendingApiKey
          ? "Settings and Resend API key saved"
          : "Settings saved successfully",
      );
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTestMode = async () => {
    const newTestMode = !formData.testMode;
    try {
      await toggleTestMode({
        testMode: newTestMode,
        sessionToken: sessionTokenArg,
      });
      setFormData((prev) => ({ ...prev, testMode: newTestMode }));
      toast.success(newTestMode ? "Test mode enabled" : "Live mode enabled");
    } catch (error) {
      toast.error("Failed to toggle test mode");
    }
  };

  const handleSendTestEmail = async () => {
    if (!hasSavedApiKey) {
      toast.error("Save a Resend API key first");
      return;
    }

    setIsTestingEmail(true);
    try {
      await sendTestEmail({
        to: formData.contactEmail,
        sessionToken: sessionTokenArg,
      });
      toast.success("Test email sent! Check your console in test mode.");
    } catch (error) {
      toast.error(`Failed to send test email: ${getErrorMessage(error)}`);
    } finally {
      setIsTestingEmail(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto grid gap-6">
      {formData.testMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <span className="text-xl">⚠️</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-800">Test Mode Active</p>
            <p className="text-sm text-amber-700">
              Emails will be logged to console instead of being sent. Toggle
              below to enable live mode.
            </p>
          </div>
        </div>
      )}

      <Card className="minimal-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-muted-foreground">
              Contact Email *
            </label>
            <Input
              value={formData.contactEmail}
              onChange={(e) =>
                setFormData({ ...formData, contactEmail: e.target.value })
              }
              placeholder="daggi.x02@gmail.com"
              className="rounded-xl h-11"
            />
            <p className="text-xs text-muted-foreground">
              This email will receive contact form submissions
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-medium text-muted-foreground">
              Resend API Key
            </label>
            <Input
              type="password"
              value={formData.resendApiKey}
              onChange={(e) =>
                setFormData({ ...formData, resendApiKey: e.target.value })
              }
              placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="rounded-xl h-11"
            />
            <p className="text-xs text-muted-foreground">
              {hasPendingApiKey
                ? "New key ready to save"
                : hasSavedApiKey
                  ? "API key is saved. Enter a new key to replace it."
                  : "Get your API key from resend.com."}
            </p>

            <div
              className={cn(
                "rounded-lg border px-3 py-2",
                hasSavedApiKey
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-amber-200 bg-amber-50",
              )}
            >
              <p
                className={cn(
                  "text-xs font-semibold",
                  hasSavedApiKey ? "text-emerald-700" : "text-amber-700",
                )}
              >
                {hasSavedApiKey
                  ? "Resend API key configured"
                  : "Resend API key not configured"}
              </p>
              {hasSavedApiKey && maskedSavedApiKey && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Saved key:{" "}
                  <span className="font-mono">{maskedSavedApiKey}</span>
                </p>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-border/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-sm">Test Mode</p>
                <p className="text-xs text-muted-foreground">
                  {formData.testMode
                    ? "Emails logged to console only"
                    : "Emails sent to real recipients"}
                </p>
              </div>
              <Button
                variant={formData.testMode ? "secondary" : "default"}
                size="sm"
                onClick={handleToggleTestMode}
                className={cn(
                  "rounded-full px-4",
                  !formData.testMode && "bg-green-600 hover:bg-green-700",
                )}
              >
                {formData.testMode ? "Enable Live Mode" : "Enable Test Mode"}
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSendTestEmail}
              disabled={isTestingEmail || !hasSavedApiKey}
              className="w-full rounded-xl"
            >
              {isTestingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Test...
                </>
              ) : (
                "Send Test Email"
              )}
            </Button>
          </div>

          <Button
            onClick={handleSave}
            disabled={isLoading || !isDirty}
            className="w-full h-11 rounded-xl font-bold tracking-tight mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            disabled={!isDirty || isLoading}
            onClick={() => {
              setFormData({
                ...initialFormData,
                resendApiKey: "",
              });
            }}
          >
            Reset Unsaved Changes
          </Button>
        </CardContent>
      </Card>

      <Card className="minimal-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-muted-foreground">
              Contact Phone
            </label>
            <Input
              value={formData.contactPhone}
              onChange={(e) =>
                setFormData({ ...formData, contactPhone: e.target.value })
              }
              placeholder="+1 (555) PHARMA-CARE"
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-muted-foreground">
              Contact Address
            </label>
            <Input
              value={formData.contactAddress}
              onChange={(e) =>
                setFormData({ ...formData, contactAddress: e.target.value })
              }
              placeholder="123 Healthcare Ave, Medical District, 10001"
              className="rounded-xl h-11"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

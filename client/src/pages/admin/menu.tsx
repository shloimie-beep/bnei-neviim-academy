import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, ChevronLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { MenuOption, AudioFile } from "@shared/schema";

type FunctionType = "none" | "play_mp3" | "transfer" | "submenu" | "conference";

interface MenuOptionData {
  optionNumber: number;
  functionType: FunctionType;
  audioFileId: string | null;
  transferNumber: string | null;
  transferTimeout: number | null;
}

function OptionBox({
  num,
  option,
  audioFiles,
  onUpdate,
  onEditSubmenu,
  isSaving,
}: {
  num: number;
  option?: MenuOption;
  audioFiles: AudioFile[];
  onUpdate: (data: MenuOptionData) => void;
  onEditSubmenu: (optionId: string) => void;
  isSaving: boolean;
}) {
  const [functionType, setFunctionType] = useState<FunctionType>(
    (option?.functionType as FunctionType) || "none"
  );
  const [audioFileId, setAudioFileId] = useState(option?.audioFileId || "");
  const [transferNumber, setTransferNumber] = useState(option?.transferNumber || "");
  const [transferTimeout, setTransferTimeout] = useState(option?.transferTimeout?.toString() || "");

  const handleFunctionChange = (value: FunctionType) => {
    setFunctionType(value);
    onUpdate({
      optionNumber: num,
      functionType: value,
      audioFileId: value === "play_mp3" ? audioFileId : null,
      transferNumber: value === "transfer" ? transferNumber : null,
      transferTimeout: value === "transfer" ? parseInt(transferTimeout) || null : null,
    });
  };

  const handleAudioChange = (value: string) => {
    setAudioFileId(value);
    onUpdate({
      optionNumber: num,
      functionType,
      audioFileId: value,
      transferNumber: null,
      transferTimeout: null,
    });
  };

  const handleTransferChange = (number: string, timeout: string) => {
    setTransferNumber(number);
    setTransferTimeout(timeout);
    onUpdate({
      optionNumber: num,
      functionType,
      audioFileId: null,
      transferNumber: number,
      transferTimeout: parseInt(timeout) || null,
    });
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-card">
      <div className="text-4xl font-bold text-center text-primary">{num}</div>
      
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Function</Label>
        <Select value={functionType} onValueChange={handleFunctionChange} disabled={isSaving}>
          <SelectTrigger data-testid={`select-function-${num}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="play_mp3">Play MP3</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="submenu">Sub-menu</SelectItem>
            <SelectItem value="conference">Conference</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {functionType === "play_mp3" && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">File</Label>
          <Select value={audioFileId} onValueChange={handleAudioChange} disabled={isSaving}>
            <SelectTrigger data-testid={`select-audio-${num}`}>
              <SelectValue placeholder="Select file" />
            </SelectTrigger>
            <SelectContent>
              {audioFiles.map((file) => (
                <SelectItem key={file.id} value={file.id}>
                  {file.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {functionType === "transfer" && (
        <>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">To</Label>
            <Input
              placeholder="+1234567890"
              value={transferNumber}
              onChange={(e) => handleTransferChange(e.target.value, transferTimeout)}
              disabled={isSaving}
              data-testid={`input-transfer-${num}`}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">End after (minutes)</Label>
            <Input
              type="number"
              placeholder="60"
              value={transferTimeout}
              onChange={(e) => handleTransferChange(transferNumber, e.target.value)}
              disabled={isSaving}
              data-testid={`input-timeout-${num}`}
            />
          </div>
        </>
      )}

      {functionType === "submenu" && option?.id && (
        <Button
          variant="link"
          className="p-0 h-auto"
          onClick={() => onEditSubmenu(option.id)}
          data-testid={`button-edit-submenu-${num}`}
        >
          Edit submenu
        </Button>
      )}
    </div>
  );
}

export default function MenuManagement() {
  const { toast } = useToast();
  const [currentMenuId, setCurrentMenuId] = useState<string | null>(null);
  const [menuPath, setMenuPath] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: "Main Menu" },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const { data: menuOptions, isLoading: menuLoading } = useQuery<MenuOption[]>({
    queryKey: ["/api/admin/menu-options", currentMenuId],
    queryFn: async () => {
      const url = currentMenuId
        ? `/api/admin/menu-options?parentMenuId=${currentMenuId}`
        : "/api/admin/menu-options?parentMenuId=null";
      const res = await fetch(url);
      return res.json();
    },
  });

  const { data: audioFiles } = useQuery<AudioFile[]>({
    queryKey: ["/api/admin/audio-files"],
  });

  const { data: settings } = useQuery<any>({
    queryKey: ["/api/admin/settings"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { optionNumber: number; parentMenuId: string | null } & Partial<MenuOptionData>) => {
      const res = await apiRequest("POST", "/api/admin/menu-options/upsert", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-options"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: async (data: { key: string; audioFileId: string | null }) => {
      const res = await apiRequest("POST", "/api/admin/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Setting saved" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to save setting", description: error.message, variant: "destructive" });
    },
  });

  const handleOptionUpdate = async (data: MenuOptionData) => {
    setIsSaving(true);
    await updateMutation.mutateAsync({
      ...data,
      parentMenuId: currentMenuId,
    });
    setIsSaving(false);
  };

  const handleEditSubmenu = (optionId: string) => {
    const option = menuOptions?.find((o) => o.id === optionId);
    if (option) {
      setMenuPath([...menuPath, { id: optionId, name: `Option ${option.optionNumber}` }]);
      setCurrentMenuId(optionId);
    }
  };

  const handleBackToMain = () => {
    if (menuPath.length > 1) {
      const newPath = menuPath.slice(0, -1);
      setMenuPath(newPath);
      setCurrentMenuId(newPath[newPath.length - 1].id);
    }
  };

  const getOptionForNumber = (num: number) => {
    return menuOptions?.find((o) => o.optionNumber === num);
  };

  const subscriberGreeting = settings?.find((s: any) => s.key === "subscriber_greeting");
  const nonSubscriberGreeting = settings?.find((s: any) => s.key === "non_subscriber_greeting");

  if (menuLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {menuPath.length > 1 && (
          <Button variant="ghost" size="icon" onClick={handleBackToMain} data-testid="button-back">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-bold">
            {menuPath[menuPath.length - 1].name}
          </h1>
          {menuPath.length > 1 && (
            <p className="text-sm text-muted-foreground">
              Press * to return to main menu
            </p>
          )}
        </div>
      </div>

      {currentMenuId === null && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Greeting for subscribers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">File</Label>
                <Select
                  value={subscriberGreeting?.audio_file_id || ""}
                  onValueChange={(v) => updateSettingMutation.mutate({ key: "subscriber_greeting", audioFileId: v })}
                >
                  <SelectTrigger data-testid="select-subscriber-greeting">
                    <SelectValue placeholder="Select greeting file" />
                  </SelectTrigger>
                  <SelectContent>
                    {audioFiles?.filter((f) => f.type === "greeting" || f.type === "menu").map((file) => (
                      <SelectItem key={file.id} value={file.id}>
                        {file.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Greeting for non-subscribers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">File</Label>
                <Select
                  value={nonSubscriberGreeting?.audio_file_id || ""}
                  onValueChange={(v) => updateSettingMutation.mutate({ key: "non_subscriber_greeting", audioFileId: v })}
                >
                  <SelectTrigger data-testid="select-non-subscriber-greeting">
                    <SelectValue placeholder="Select greeting file" />
                  </SelectTrigger>
                  <SelectContent>
                    {audioFiles?.filter((f) => f.type === "greeting" || f.type === "non_subscriber").map((file) => (
                      <SelectItem key={file.id} value={file.id}>
                        {file.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Options 1-9</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <OptionBox
                key={num}
                num={num}
                option={getOptionForNumber(num)}
                audioFiles={audioFiles || []}
                onUpdate={handleOptionUpdate}
                onEditSubmenu={handleEditSubmenu}
                isSaving={isSaving}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

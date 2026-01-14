import { Phone, ExternalLink, Music, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HotlineManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Hotline Management</h1>
        <p className="text-muted-foreground">
          Manage your hotline audio files and conference settings through the Voitex portal.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Audio Library
            </CardTitle>
            <CardDescription>
              Manage your greetings, menus, and story audio files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Upload and organize all your hotline audio content including greetings, menu prompts, and stories for kids.
            </p>
            <a 
              href="https://portal.voitex.com/library" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button data-testid="button-voitex-library">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Audio Library
              </Button>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Live Conference
            </CardTitle>
            <CardDescription>
              Manage active conference calls and participants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Monitor live calls, manage participants, and control mute settings for your group conference sessions.
            </p>
            <a 
              href="https://portal.voitex.com/conferenceLive" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button data-testid="button-voitex-conference">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Conference Manager
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>

      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            About Voitex Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your hotline is powered by Voitex, which handles all IVR (Interactive Voice Response) functionality, 
            audio file management, and conference call features. Use the links above to access the full 
            management dashboard where you can configure your hotline experience.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

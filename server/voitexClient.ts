import FormData from "form-data";
import fs from "fs";
import path from "path";

const VOITEX_RECORDING_API = "https://recording.voitexapi.com/upload/";
const VOITEX_NOTIFY_API = "https://notify.voitexapi.com/";
const VOITEX_SMS_API = "https://sms.voitexapi.com/";
const VOITEX_CONTACTS_API = "https://contacts.voitexapi.com/";

interface VoitexResponse {
  status: "success" | "error";
  data?: string;
  errors: string[];
  reference_id?: string;
}

interface UploadRecordingParams {
  albumNumber: number;
  filePath: string;
  sortNumber?: number;
  displayName?: string;
  override?: boolean;
}

interface CreateTTSParams {
  albumNumber: number;
  text: string;
  sortNumber?: number;
  override?: boolean;
}

interface NotificationCallParams {
  cid: string;
  to: string;
  type: "goto" | "stream";
  routeNumber?: string;
  branchNumber?: string;
  sfileId?: string;
}

interface SendSMSParams {
  from: string;
  to: string;
  message: string;
}

interface ContactParams {
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  notes?: string;
}

export class VoitexClient {
  private authKey: string;

  constructor(authKey: string) {
    this.authKey = authKey;
  }

  private async makeRequest(
    url: string,
    formData: FormData
  ): Promise<VoitexResponse> {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Auth-Key": this.authKey,
        ...formData.getHeaders(),
      },
      body: formData as any,
    });

    if (!response.ok) {
      throw new Error(`Voitex API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async uploadRecording(params: UploadRecordingParams): Promise<VoitexResponse> {
    const formData = new FormData();
    formData.append("album_number", params.albumNumber.toString());
    formData.append("upload_file", fs.createReadStream(params.filePath));
    
    if (params.sortNumber !== undefined) {
      formData.append("sort_number", params.sortNumber.toString());
    }
    if (params.displayName) {
      formData.append("display_name", params.displayName);
    }
    if (params.override) {
      formData.append("override", "yes");
    }

    return this.makeRequest(VOITEX_RECORDING_API, formData);
  }

  async createTTS(params: CreateTTSParams): Promise<VoitexResponse> {
    const formData = new FormData();
    formData.append("album_number", params.albumNumber.toString());
    formData.append("type", "tts");
    formData.append("text", params.text);
    
    if (params.sortNumber !== undefined) {
      formData.append("sort_number", params.sortNumber.toString());
    }
    if (params.override) {
      formData.append("override", "yes");
    }

    return this.makeRequest(VOITEX_RECORDING_API, formData);
  }

  async makeNotificationCall(params: NotificationCallParams): Promise<VoitexResponse> {
    const formData = new FormData();
    formData.append("cid", params.cid);
    formData.append("to", params.to);
    formData.append("type", params.type);
    
    if (params.routeNumber) {
      formData.append("route_number", params.routeNumber);
    }
    if (params.branchNumber) {
      formData.append("branch_number", params.branchNumber);
    }
    if (params.sfileId) {
      formData.append("sfile_id", params.sfileId);
    }

    return this.makeRequest(VOITEX_NOTIFY_API, formData);
  }

  async sendSMS(params: SendSMSParams): Promise<VoitexResponse> {
    const formData = new FormData();
    formData.append("from", params.from);
    formData.append("to", params.to);
    formData.append("message", params.message);

    return this.makeRequest(VOITEX_SMS_API, formData);
  }

  async createContact(params: ContactParams): Promise<VoitexResponse> {
    const formData = new FormData();
    formData.append("phone_number", params.phoneNumber);
    formData.append("action", "create");
    
    if (params.firstName) {
      formData.append("first_name", params.firstName);
    }
    if (params.lastName) {
      formData.append("last_name", params.lastName);
    }
    if (params.email) {
      formData.append("email", params.email);
    }
    if (params.notes) {
      formData.append("notes", params.notes);
    }

    return this.makeRequest(VOITEX_CONTACTS_API, formData);
  }

  async updateContact(params: ContactParams): Promise<VoitexResponse> {
    const formData = new FormData();
    formData.append("phone_number", params.phoneNumber);
    formData.append("action", "update");
    
    if (params.firstName) {
      formData.append("first_name", params.firstName);
    }
    if (params.lastName) {
      formData.append("last_name", params.lastName);
    }
    if (params.email) {
      formData.append("email", params.email);
    }
    if (params.notes) {
      formData.append("notes", params.notes);
    }

    return this.makeRequest(VOITEX_CONTACTS_API, formData);
  }

  async deleteContact(phoneNumber: string): Promise<VoitexResponse> {
    const formData = new FormData();
    formData.append("phone_number", phoneNumber);
    formData.append("action", "delete");

    return this.makeRequest(VOITEX_CONTACTS_API, formData);
  }
}

let voitexClient: VoitexClient | null = null;

export function getVoitexClient(): VoitexClient {
  if (!voitexClient) {
    const authKey = process.env.VOITEX_AUTH_KEY;
    if (!authKey) {
      throw new Error("VOITEX_AUTH_KEY environment variable is not set");
    }
    voitexClient = new VoitexClient(authKey);
  }
  return voitexClient;
}

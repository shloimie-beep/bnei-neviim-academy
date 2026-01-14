import fetch from "node-fetch";

const VOITEX_API_URL = "https://contacts.voitexapi.com/";

interface VoitexResponse {
  status: "success" | "error";
  data?: string | object;
  errors?: string[];
}

interface ContactData {
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneType?: "H" | "M";
  label?: string;
}

class VoitexService {
  private authKey: string | null = null;

  initialize() {
    this.authKey = process.env.VOITEX_AUTH_KEY || null;
    if (this.authKey) {
      console.log("[Voitex] Service initialized");
    } else {
      console.log("[Voitex] Auth key not configured - service disabled");
    }
  }

  isConfigured(): boolean {
    return !!this.authKey;
  }

  private async makeRequest(body: URLSearchParams): Promise<VoitexResponse> {
    if (!this.authKey) {
      throw new Error("Voitex auth key not configured");
    }

    const response = await fetch(VOITEX_API_URL, {
      method: "POST",
      headers: {
        "Auth-Key": this.authKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const result = (await response.json()) as VoitexResponse;
    return result;
  }

  validatePhoneNumber(phone: string): { valid: boolean; cleaned: string; error?: string } {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      return { valid: false, cleaned, error: `Phone number too short: ${phone}` };
    }
    if (cleaned.length > 11) {
      return { valid: false, cleaned, error: `Phone number too long: ${phone}` };
    }
    // For 11-digit numbers, should start with 1 (US country code)
    if (cleaned.length === 11 && !cleaned.startsWith('1')) {
      return { valid: false, cleaned, error: `Invalid country code for: ${phone}` };
    }
    return { valid: true, cleaned };
  }

  async createContact(data: ContactData): Promise<VoitexResponse> {
    // Validate phone first
    const phoneValidation = this.validatePhoneNumber(data.phone);
    if (!phoneValidation.valid) {
      return { status: "error", errors: [phoneValidation.error || "Invalid phone number"] };
    }

    const params = new URLSearchParams();
    params.append("function", "create");
    params.append("phone", phoneValidation.cleaned);
    
    // phone_type must be H (Home) or M (Mobile) per Voitex docs
    params.append("phone_type", data.phoneType || "M");
    
    if (data.firstName) {
      params.append("first_name", data.firstName);
    }
    if (data.lastName) {
      params.append("last_name", data.lastName);
    }
    if (data.label) {
      params.append("label", data.label);
    }

    console.log(`[Voitex] Creating contact for phone: ${phoneValidation.cleaned}`);
    const result = await this.makeRequest(params);
    
    if (result.status === "success") {
      console.log(`[Voitex] Contact created successfully for ${phoneValidation.cleaned}`);
    } else {
      console.error(`[Voitex] Failed to create contact: ${result.errors?.join(", ")}`);
    }
    
    return result;
  }

  async updateContact(phone: string, data: Partial<ContactData> & { email?: string }): Promise<VoitexResponse> {
    const params = new URLSearchParams();
    params.append("function", "update");
    params.append("phone", phone);
    
    if (data.firstName !== undefined) {
      params.append("first_name", data.firstName);
    }
    if (data.lastName !== undefined) {
      params.append("last_name", data.lastName);
    }
    if (data.email !== undefined) {
      params.append("email", data.email);
    }

    console.log(`[Voitex] Updating contact for phone: ${phone}`);
    const result = await this.makeRequest(params);
    
    if (result.status === "success") {
      console.log(`[Voitex] Contact updated successfully for ${phone}`);
    } else {
      console.error(`[Voitex] Failed to update contact: ${result.errors?.join(", ")}`);
    }
    
    return result;
  }

  async deleteContact(phone: string): Promise<VoitexResponse> {
    // Validate phone first
    const phoneValidation = this.validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      console.log(`[Voitex] Invalid phone for delete: ${phoneValidation.error}`);
      return { status: "success", data: "Skipped invalid phone" };
    }

    const params = new URLSearchParams();
    params.append("function", "delete");
    params.append("phone", phoneValidation.cleaned);

    console.log(`[Voitex] Deleting contact for phone: ${phoneValidation.cleaned}`);
    const result = await this.makeRequest(params);
    
    if (result.status === "success") {
      console.log(`[Voitex] Contact deleted successfully for ${phoneValidation.cleaned}`);
    } else {
      // If contact not found, that's fine - it's already not there
      if (result.errors?.some(e => e.includes("No contact found"))) {
        console.log(`[Voitex] Contact not found for ${phoneValidation.cleaned} - already removed`);
        return { status: "success", data: "Contact already removed" };
      }
      console.error(`[Voitex] Failed to delete contact: ${result.errors?.join(", ")}`);
    }
    
    return result;
  }

  async selectContact(phone: string): Promise<VoitexResponse> {
    const params = new URLSearchParams();
    params.append("function", "select");
    params.append("phone", phone);

    const result = await this.makeRequest(params);
    return result;
  }

  async createOrUpdateContact(data: ContactData & { email?: string }): Promise<VoitexResponse> {
    // Validate phone first
    const phoneValidation = this.validatePhoneNumber(data.phone);
    if (!phoneValidation.valid) {
      return { status: "error", errors: [phoneValidation.error || "Invalid phone number"] };
    }

    // Use cleaned phone for all operations
    const cleanedData = { ...data, phone: phoneValidation.cleaned };

    // First try to create
    const createResult = await this.createContact(cleanedData);
    
    if (createResult.status === "success") {
      // If email provided, update the contact with email (create doesn't support email)
      if (data.email) {
        await this.updateContact(phoneValidation.cleaned, { email: data.email });
      }
      return createResult;
    }
    
    // If contact already exists, update it instead
    if (createResult.errors?.some(e => e.includes("contact already exists"))) {
      console.log(`[Voitex] Contact exists, updating instead`);
      return this.updateContact(phoneValidation.cleaned, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      });
    }
    
    return createResult;
  }
}

export const voitexService = new VoitexService();

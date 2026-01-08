import type { Request, Response } from "express";
import { storage } from "./storage";

interface VoitexCallRequest {
  call_id: string;
  cid: string;
  cnam: string;
  contact_info: string | null;
  date_time: string;
  did: string;
  branch_data: Array<{ branch: string; input: string }>;
  payment_info: Array<{
    last_four: string;
    expiration: string;
    cvv: number;
    zip: string;
    phone: string;
    amount: string;
    transaction_id: string;
  }>;
  variables: Array<Record<string, string>>;
}

interface PlayItem {
  type: "file" | "tts";
  album?: string;
  sort?: string;
  text?: string;
}

interface VoitexCallResponse {
  goto?: string;
  play?: PlayItem[];
  inputs?: Record<string, string>;
  variables?: Record<string, string>;
}

export async function handleVoitexWebhook(req: Request, res: Response) {
  try {
    const callData: VoitexCallRequest = req.body;
    console.log("Voitex webhook received:", JSON.stringify(callData, null, 2));

    const callerPhone = callData.cid;

    const isSubscriber = await checkIfSubscriber(callerPhone);
    const isWhitelisted = await checkIfWhitelisted(callerPhone);

    await logCall(callData, isSubscriber, isWhitelisted);

    const response = await buildCallResponse(callData, isSubscriber, isWhitelisted);
    
    console.log("Voitex response:", JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error: any) {
    console.error("Voitex webhook error:", error);
    res.json({
      play: [{ type: "tts", text: "We're sorry, there was an error processing your call. Please try again later." }],
    });
  }
}

async function checkIfSubscriber(phoneNumber: string): Promise<boolean> {
  const phone = await storage.getPhoneNumberByNumber(phoneNumber);
  if (!phone) return false;

  const user = await storage.getUser(phone.userId);
  if (!user) return false;

  return user.subscriptionStatus === "active" || user.subscriptionStatus === "trial";
}

async function checkIfWhitelisted(phoneNumber: string): Promise<boolean> {
  const whitelisted = await storage.getWhitelistedNumber(phoneNumber);
  return !!whitelisted;
}

async function logCall(callData: VoitexCallRequest, isSubscriber: boolean, isWhitelisted: boolean) {
  try {
    const phone = await storage.getPhoneNumberByNumber(callData.cid);
    await storage.createCallLog({
      callUuid: callData.call_id,
      fromNumber: callData.cid,
      toNumber: callData.did,
      userId: phone?.userId || null,
      status: "answered",
      isSubscriber: isSubscriber || isWhitelisted,
    });
  } catch (error) {
    console.error("Error logging call:", error);
  }
}

async function buildCallResponse(
  callData: VoitexCallRequest,
  isSubscriber: boolean,
  isWhitelisted: boolean
): Promise<VoitexCallResponse> {
  const lastBranch = callData.branch_data.length > 0 
    ? callData.branch_data[callData.branch_data.length - 1] 
    : null;

  if (!lastBranch || lastBranch.branch === "0") {
    return buildMainMenuResponse(isSubscriber, isWhitelisted);
  }

  const input = lastBranch.input;
  const branch = lastBranch.branch;

  if (input === "*") {
    return buildMainMenuResponse(isSubscriber, isWhitelisted);
  }

  return handleBranchNavigation(branch, input, callData.branch_data, isSubscriber, isWhitelisted);
}

async function buildMainMenuResponse(
  isSubscriber: boolean,
  isWhitelisted: boolean
): Promise<VoitexCallResponse> {
  const settings = await storage.getSystemSetting("greeting");
  const nonSubSettings = await storage.getSystemSetting("non_subscriber_greeting");

  if (isSubscriber || isWhitelisted) {
    const greetingText = settings?.value || "Welcome to OneTimeOneTime Kids Hotline!";
    const menuOptions = await storage.getAllMenuOptions();
    
    const play: PlayItem[] = [
      { type: "tts", text: greetingText },
    ];

    const inputs: Record<string, string> = {
      "*": "0",
    };

    for (const option of menuOptions.filter(o => !o.parentMenuId)) {
      if (option.isActive) {
        const keyPress = option.optionNumber.toString();
        play.push({ type: "tts", text: `Press ${keyPress} for ${option.label || 'this option'}.` });
        inputs[keyPress] = option.id;
      }
    }

    return { play, inputs };
  } else {
    const nonSubGreeting = nonSubSettings?.value || 
      "Welcome to OneTimeOneTime Kids Hotline. This service requires a subscription. Please visit our website to subscribe.";
    
    return {
      play: [{ type: "tts", text: nonSubGreeting }],
    };
  }
}

async function handleBranchNavigation(
  branch: string,
  input: string,
  branchData: Array<{ branch: string; input: string }>,
  isSubscriber: boolean,
  isWhitelisted: boolean
): Promise<VoitexCallResponse> {
  if (!isSubscriber && !isWhitelisted) {
    return {
      play: [{ type: "tts", text: "This feature requires an active subscription." }],
      goto: "0",
    };
  }

  const menuOption = await storage.getMenuOption(branch);
  if (!menuOption) {
    return {
      play: [{ type: "tts", text: "Invalid selection. Returning to main menu." }],
      goto: "0",
    };
  }

  switch (menuOption.functionType) {
    case "play_mp3":
      return handlePlayAudio(menuOption, branchData);
    case "submenu":
      return handleSubmenu(menuOption);
    case "conference":
      return handleConference(menuOption);
    default:
      return {
        play: [{ type: "tts", text: "This feature is not available. Returning to main menu." }],
        goto: "0",
      };
  }
}

async function handlePlayAudio(menuOption: any, branchData: Array<{ branch: string; input: string }>): Promise<VoitexCallResponse> {
  const parentMenuId = menuOption.parentMenuId;
  
  if (menuOption.audioFileId) {
    const audioFile = await storage.getAudioFile(menuOption.audioFileId);
    if (audioFile && audioFile.voitexAlbum && audioFile.voitexSort) {
      const play: PlayItem[] = [
        { type: "file", album: audioFile.voitexAlbum, sort: audioFile.voitexSort },
      ];

      const inputs: Record<string, string> = {
        "*": parentMenuId || "0",
      };

      return {
        play,
        inputs,
        variables: {
          return_to_menu: parentMenuId || "0",
        },
      };
    }
  }
  
  return {
    play: [{ type: "tts", text: "The requested content is not available. Press star to go back." }],
    inputs: { "*": parentMenuId || "0" },
  };
}

async function handleSubmenu(menuOption: any): Promise<VoitexCallResponse> {
  const allOptions = await storage.getAllMenuOptions();
  const childOptions = allOptions.filter(o => o.parentMenuId === menuOption.id);
  
  const play: PlayItem[] = [
    { type: "tts", text: menuOption.label },
  ];

  const inputs: Record<string, string> = {
    "*": menuOption.parentMenuId || "0",
  };

  for (const child of childOptions) {
    if (child.isActive) {
      const keyPress = child.optionNumber.toString();
      play.push({ type: "tts", text: `Press ${keyPress} for ${child.label || 'this option'}.` });
      inputs[keyPress] = child.id;
    }
  }

  play.push({ type: "tts", text: "Press star to go back." });

  return { play, inputs };
}

async function handleConference(menuOption: any): Promise<VoitexCallResponse> {
  return {
    play: [
      { type: "tts", text: "You are now joining the conference call. Please wait while we connect you." },
    ],
    variables: { conference_id: menuOption.id },
  };
}

import { Request, Response } from "express";
import { chatWithDocument, chatGeneral } from "../services/chatService.js";

export async function chatDocument(req: Request, res: Response) {
  const { documentId, messages } = req.body;
  if (!documentId || !messages) {
    return res.status(400).json({ error: "Missing documentId or messages" });
  }

  try {
    const assistantResponse = await chatWithDocument(documentId, messages);
    res.json({ assistantResponse });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
}

export async function chatGeneralHandler(req: Request, res: Response) {
  const newMessage: string = req.body.newMessage;

  try {
    const result = await chatGeneral(newMessage);
    if ("error" in result) {
      return res.status(404).json({ error: result.error });
    }
    res.json({ assistantResponse: result.assistantResponse });
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
}

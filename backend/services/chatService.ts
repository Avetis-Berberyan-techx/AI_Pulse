import { ObjectId } from "mongodb";
import { ensureConnected, client, dbName, chatCollection } from "../config/db.js";
import { getRetrieverForDocument } from "./retrieverService.js";

type ChatMessage = {
  role: string;
  content: string;
  createdAt?: Date;
};

type RetrieverDoc = {
  pageContent: string;
};

export async function chatWithDocument(
  documentId: string,
  messages: ChatMessage[],
) {
  await ensureConnected();
  const retriever = await getRetrieverForDocument(new ObjectId(documentId), 5);
  const topChunks = await retriever._getRelevantDocuments(
    messages[messages.length - 1].content,
  );

  const context = (topChunks as RetrieverDoc[])
    .map((c) => c.pageContent)
    .join("\n---\n");

  const systemPrompt = `You are an AI Onboarding Assistant. Use the context below to answer. If answer isn't in the context, say "I don't know". Always cite the document name.\n${context}`;
  const assistantResponse = `Simulated LLM response based on context:\n${systemPrompt}`;

  const db = client.db(dbName);
  const chatSession = {
    documentId,
    title: `Chat for ${documentId}`,
    messages: [
      ...messages,
      {
        role: "assistant",
        content: assistantResponse,
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await db.collection(chatCollection).insertOne(chatSession);

  return assistantResponse;
}

export async function chatGeneral(newMessage: string) {
  await ensureConnected();
  const collection = client.db(dbName).collection(chatCollection);

  const chat = await collection.findOne({ type: "general" });
  if (!chat) return { error: "Chat not found" } as const;

  const userMessage = {
    role: "user",
    content: newMessage,
    createdAt: new Date(),
  };

  await collection.updateOne({ _id: chat._id }, [
    {
      $set: {
        messages: {
          $concatArrays: [{ $ifNull: ["$messages", []] }, [userMessage]],
        },
        updatedAt: new Date(),
      },
    },
  ]);

  const updatedChat = await collection.findOne({ _id: chat._id });
  const messages = updatedChat?.messages ?? [];
  if (!messages.length) return { error: "Missing messages" } as const;

  const userQuery = messages[messages.length - 1].content;
  const retriever = await getRetrieverForDocument();
  const relevantDocs = await retriever._getRelevantDocuments(userQuery);

  const context = (relevantDocs as RetrieverDoc[])
    .map((d) => d.pageContent)
    .join("\n---\n");

  const systemPrompt = `You are an AI Onboarding Assistant. Use the context below to answer. If answer isn't in the context, say "I don't know". Always cite the document name.\n${context}`;

  const assistantResponse = {
    role: "assistant",
    content: `Simulated LLM response based on context:\n${systemPrompt}`,
    createdAt: new Date(),
  };

  await collection.updateOne({ _id: chat._id }, [
    {
      $set: {
        messages: {
          $concatArrays: [
            { $ifNull: ["$messages", []] },
            [assistantResponse],
          ],
        },
        updatedAt: new Date(),
      },
    },
  ]);

  return { assistantResponse: assistantResponse.content } as const;
}

type ChatgptMessage = {
  content: { parts: string[] };
};

export type ChatgptRequestBody = {
  messages: ChatgptMessage[];
};

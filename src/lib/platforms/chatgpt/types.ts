type ChatgptMessage = {
  id?: string;
  content?: { parts: string[] };
};

export type ChatgptRequestBody = {
  messages?: ChatgptMessage[];
};

import { ChatgptHook } from "./chatgpt";

export function hooks() {
  return [new ChatgptHook()];
}

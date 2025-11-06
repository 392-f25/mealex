export type Message = {
  id: string;
  sender: string;
  receiver: string;
  body: string;
  resolved: boolean;
}
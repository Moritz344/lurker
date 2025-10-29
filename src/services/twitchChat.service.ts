import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subject, of, throwError } from "rxjs";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from "@angular/common/http";
import { switchMap, map, catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class TwitchChatService implements OnDestroy {
  private socket?: WebSocket;
  private messageSubject = new Subject<string>();
  public messages$: Observable<string> = this.messageSubject.asObservable();

  constructor(private http: HttpClient) {}

  connect(token: string, username: string, channel: string) {
    this.disconnect();

    this.socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

    this.socket.addEventListener("open", () => {
      console.log("Twitch Chat verbunden");
      console.log("oauth:", token);
      console.log("user:", username);
      console.log("channel:", channel);

      this.socket!.send(`PASS oauth:${token}`);
      this.socket!.send(`NICK ${username}`);
      this.socket!.send(`JOIN #${channel}`);
    });

    this.socket.addEventListener("message", (event) => {
      const raw = event.data as string;
      if (raw.startsWith("PING")) {
        this.socket!.send("PONG :tmi.twitch.tv");
        return;
      }

      const match = raw.match(/:(\w+)!.* PRIVMSG #\w+ :(.+)/);
      if (match) {
        const [, user, message] = match;
        this.messageSubject.next(`${user}: ${message}`);
      }
    });

    this.socket.addEventListener("close", () => {
      console.log("Twitch Chat getrennt");
    });
  }

  getStreamInfo(channel: string, token: string) {
    const url = "https://api.twitch.tv/helix/streams?user_login=" + channel;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-ID": "ds3ban6ylu8w882wox7f1xyr9s7v56",
      "Content-Type": "application/json",
    });

    return this.http.get(url, { headers });
  }

  getUserColor() {}

  sendAnnouncement(
    broadcaster_id: string,
    moderator_id: string,
    message: string,
    color: string,
    token: string,
  ) {
    const url = `https://api.twitch.tv/helix/chat/announcements?broadcaster_id=${broadcaster_id}&moderator_id=${moderator_id}`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-ID": "ds3ban6ylu8w882wox7f1xyr9s7v56",
      "Content-Type": "application/json",
    });

    const body = {
      message: message,
    };

    return this.http.post(url, body, { headers });
  }

  sendPoll(
    duration: number,
    title: string,
    broadcaster_id: string,
    token: string,
    choices: string[],
  ) {
    const url = `https://api.twitch.tv/helix/polls`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-ID": "ds3ban6ylu8w882wox7f1xyr9s7v56",
      "Content-Type": "application/json",
    });

    const choiceObject = choices.map((choice) => ({ title: choice }));

    console.log("Broadcaster", broadcaster_id);
    console.log("Choices", choiceObject);

    const body = {
      duration: duration,
      title: title,
      broadcaster_id: broadcaster_id,
      choices: choiceObject,
    };

    return this.http.post(url, body, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        alert(
          "Poll could not be created. You have to be an affiliate or twitch partner",
        );
        return throwError(error);
      }),
    );
  }

  sendMessage(
    channel: string,
    senderId: string,
    broadcastId: string,
    message: string,
    token: string,
  ) {
    const url = "https://api.twitch.tv/helix/chat/messages";

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-ID": "ds3ban6ylu8w882wox7f1xyr9s7v56",
      "Content-Type": "application/json",
    });

    const body = {
      channel: channel,
      message: message,
      sender_id: senderId,
      broadcaster_id: broadcastId,
    };

    return this.http.post(url, body, { headers });
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
    }
  }

  Userlogout() {
    this.disconnect();
    localStorage.clear();
  }

  UserRelog() {
    this.Userlogout();
    const url =
      "https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=ds3ban6ylu8w882wox7f1xyr9s7v56&redirect_uri=http://localhost:4200&scope=chat:edit moderator:manage:announcements moderation:read channel:manage:moderators channel:manage:polls user:write:chat chat:read";
    window.location.href = url;
  }

  ngOnDestroy() {
    this.disconnect();
  }
}

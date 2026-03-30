import { Injectable, OnDestroy, ɵɵpureFunction0 } from "@angular/core";
import { Observable, Subject, of, throwError, BehaviorSubject } from "rxjs";
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
  private badgeInfoSubject = new Subject<string[]>();
  private replyMessageBody = new Subject<{ to: string, msg: string }>();
  private chatColor = new Subject<string>();
  public messages$: Observable<string> = this.messageSubject.asObservable();

  constructor(private http: HttpClient) { }

  connect(token: string, username: string, channel: string) {
    this.disconnect();

    this.socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");


    this.socket.addEventListener("open", () => {
      //console.log("Twitch Chat verbunden");
      //console.log("oauth:", token);
      //console.log("user:", username);
      //console.log("channel:", channel);

      this.socket!.send(`PASS oauth:${token}`);
      this.socket!.send(`NICK ${username}`);
      this.socket!.send(`JOIN #${channel}`);
      this.socket!.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
    });

    this.socket.addEventListener("message", (event) => {
      const raw = event.data as string;
      if (raw.startsWith("PING")) {
        this.socket!.send("PONG :tmi.twitch.tv");
        return;
      }


      const match = raw.match(/:(\w+)!.* PRIVMSG #\w+ :(.+)/);
      if (match) {
        let badgesArray = raw.split(";")[1].split("badges=")[1].split(",");
        let chatColorString = raw.split(";")[3].split("color=")[1];
        const [, user, message] = match;

        this.messageSubject.next(`${user}: ${message}`);
        this.badgeInfoSubject.next(badgesArray);
        this.chatColor.next(chatColorString);
      }
    });

    this.socket.addEventListener("close", () => {
      console.log("Twitch Chat getrennt");
    });
  }


  getChatterBadge() {
    return this.badgeInfoSubject.asObservable();
  }
  getChatterColor() {
    return this.chatColor.asObservable();
  }

  getImageFromBadgeName(badges: string[], badgeImages: any) {
    let badgesFound: { img: string, img_2x: string, title: string }[] = [{ img: "", img_2x: "", title: "" }];
    let subscriber_ids: string[] = [];

    let bits_ids: string[] = [];

    let global_types: string[] = [];
    let global_ids: string[] = [];

    if (badges) {
      for (let i = 0; i < badges.length; i++) {
        if (badges[i].includes("subscriber")) {
          // channel subscriber case
          subscriber_ids.push(badges[i].split("/")[1]);
        } else if (badges[i].includes("bits")) {
          // channel bits case
          bits_ids.push(badges[i].split("/")[1]);
        } else {
          // global case
          global_types.push(badges[i].split("/")[0]);
          global_ids.push(badges[i].split("/")[1]);
        }
      }

    }

    if (subscriber_ids.length > 0 && badgeImages.subscriber) {
      const subscriberSet = new Set(subscriber_ids);
      badgeImages.subscriber.forEach((badge: any) => {
        if (subscriberSet.has(badge.id)) {
          badgesFound.push({ img: badge.image_url_1x, img_2x: badge.image_url_2x, title: badge.title });
        }
      });


    }
    if (bits_ids.length > 0 && badgeImages.bits) {
      const bitsSet = new Set(bits_ids);
      badgeImages.bits.forEach((badge: any) => {
        if (bitsSet.has(badge.id)) {
          badgesFound.push({ img: badge.image_url_1x, img_2x: badge.image_url_2x, title: badge.title });
        }
      });
    }

    if (global_ids.length > 0 && badgeImages.global) {
      const typeSet = new Set(global_types);
      const idSet = new Set(global_ids);
      badgeImages.global.forEach((badge: any) => {
        if (typeSet.has(badge.set_id)) {
          badge.versions.forEach((version: any) => {
            if (idSet.has(version.id)) {
              badgesFound.push({ img: version.image_url_1x, img_2x: version.image_url_2x, title: version.title });
            }
          });
        }
      });

    }

    badgesFound.shift();

    return badgesFound;
  }


  getChannelBadges(broadcaster_id: string) {
    const url = "https://api.twitch.tv/helix/chat/badges?broadcaster_id=" + broadcaster_id;

    const token: any = localStorage.getItem("twitch_token");

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-ID": "ds3ban6ylu8w882wox7f1xyr9s7v56",
      "Content-Type": "application/json",
    });

    return this.http.get(url, { headers });
  }

  fetchStreamerInfo(channel: string): Observable<any> {
    if (!channel) return of(null);
    const token: any = localStorage.getItem("twitch_token");
    return this.getStreamInfo(channel, token).pipe(
      map((result: any) => {
        if (result.data.length === 0) {
          return {
            title: channel + " is offline",
            game_name: "",
            thumbnail: "",
            viewer_count: "",
          };
        }
        const streamerData = result.data[0];
        const viewers = streamerData.viewer_count;
        const viewers_split = viewers.toString().split("");
        let viewerString = viewers.toString();

        if (viewers >= 1000 && viewers < 10000) {
          viewerString = viewers_split[0] + "." + viewers_split[1] + viewers_split[2] + viewers_split[3];
        } else if (viewers >= 10000 && viewers < 100000) {
          viewerString = viewers_split[0] + viewers_split[1] + "." + viewers_split[2] + viewers_split[3] + viewers_split[4];
        }

        return {
          title: streamerData.title,
          thumbnail: "https://static-cdn.jtvnw.net/previews-ttv/live_user_" + channel.toLowerCase().replace(/\s/g, '') + "-300x200.jpg",
          game_name: streamerData.game_name,
          viewer_count: viewerString,
        };
      })
    );
  }

  getGlobalChatBadges() {
    const url = "https://api.twitch.tv/helix/chat/badges/global";

    const token: any = localStorage.getItem("twitch_token");

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-ID": "ds3ban6ylu8w882wox7f1xyr9s7v56",
      "Content-Type": "application/json",
    });

    return this.http.get(url, { headers });
  }

  getUserFollows(
    user_id: string,
    first: number,
    afterString: string,
    beforeString: string,
  ) {
    let url = `https://api.twitch.tv/helix/channels/followed?user_id=${user_id}&first=${first}`;
    if (afterString !== "") {
      url = `https://api.twitch.tv/helix/channels/followed?user_id=${user_id}&first=${first}&after=${afterString}`;
    }
    if (beforeString !== "") {
      url = `https://api.twitch.tv/helix/channels/followed?user_id=${user_id}&first=${first}&before=${beforeString}`;
    }
    const token: any = localStorage.getItem("twitch_token");

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-ID": "ds3ban6ylu8w882wox7f1xyr9s7v56",
      "Content-Type": "application/json",
    });

    return this.http.get(url, { headers });
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

  getChannelEmotes(broadcaster_id: string) {
    const url = `https://api.twitch.tv/helix/chat/emotes?broadcaster_id=${broadcaster_id}`;
    const token: any = localStorage.getItem("twitch_token");

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-ID": "ds3ban6ylu8w882wox7f1xyr9s7v56",
      "Content-Type": "application/json",
    });
    return this.http.get(url, { headers });
  }


  getGlobalEmotes() {
    const url = `https://api.twitch.tv/helix/chat/emotes/global`;
    const token: any = localStorage.getItem("twitch_token");

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-ID": "ds3ban6ylu8w882wox7f1xyr9s7v56",
      "Content-Type": "application/json",
    });


    return this.http.get(url, { headers });


  }


  setEmoji(name: string) {
    let emoji = localStorage.setItem("emoji", name);
  }



  getChatters(broadcaster_id: string, moderator_id: string) {
    const url = `https://api.twitch.tv/helix/chat/chatters?broadcaster_id=${broadcaster_id}&moderator_id=${moderator_id}`;
    const token: any = localStorage.getItem("twitch_token");

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-ID": "ds3ban6ylu8w882wox7f1xyr9s7v56",
      "Content-Type": "application/json",
    });

    return this.http.get(url, { headers });

  }


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

import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of, BehaviorSubject } from "rxjs";
import { switchMap, map, catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  loginStatus: boolean = false;
  loginStatusSubject = new BehaviorSubject<boolean>(this.loginStatus);

  currentChannel: string = "";
  currentChannelSubject = new BehaviorSubject<string>(this.currentChannel);


  lastMessageUser: string = "";
  lastMessageUserSubject = new BehaviorSubject<string>(this.lastMessageUser);

  constructor(private http: HttpClient) { }

  setLoginStatus(isLogged: boolean) {
    this.loginStatus = isLogged;
    this.loginStatusSubject.next(this.loginStatus);
  }
  getLoginStatus() {
    return this.loginStatusSubject.asObservable();
  }

  setAccessToken(token: string) {
    localStorage.setItem("twitch_token", token);
  }

  getAccessToken() {
    return of(localStorage.getItem("twitch_token"));
  }

  setUserName(username: string) {
    localStorage.setItem("username", username);
  }
  getUserName() {
    return of(localStorage.getItem("username"));
  }

  setCurrentChannel(name: string) {
    this.currentChannel = name;
    this.currentChannelSubject.next(this.currentChannel);
  }

  getCurrentChannel() {
    return this.currentChannelSubject.asObservable();
  }

  applyUserSettings(settings: any) {
    console.log(settings);
  }

  async openExternalLink(url: string) {
    return await (window as any).electronAPI.openExternalLink(url);
  }

  async openEmojiPicker() {
    return await (window as any).electronAPI.openEmojiPicker();
  }

  async openUserCard() {
    return await (window as any).electronAPI.openUserCard();
  }

  async openChatterList() {
    return await (window as any).electronAPI.openChatterList();

  }

  async openSettings() {
    return await (window as any).electronAPI.openSettings();
  }

  async closeWindow(window_name: string) {
    return await (window as any).electronAPI.closeWindow(window_name);
  }


  getUserColor(token: string, user_id: string) {
    console.log(token, user_id);
    const url = "https://api.twitch.tv/helix/chat/color?user_id=" + user_id;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-ID": "ds3ban6ylu8w882wox7f1xyr9s7v56",
      "Content-Type": "application/json",
    });

    return this.http.get(url, { headers });
  }

  setUserId(id: string) {
    localStorage.setItem("user_id", id);
  }

  getUserColorStatus() {
    const settings: any = localStorage.getItem("settings");
    if (!settings) {
      return;
    }
    const settingsJSON = JSON.parse(settings);
    let chatColorState = settingsJSON[0]["chatColorState"];

    return chatColorState;
  }

  getUserTimestampFormat() {
    const settings: any = localStorage.getItem("settings");
    if (!settings) {
      return;
    }
    const settingsJSON = JSON.parse(settings);
    return settingsJSON[0]["timeStampFormat"];
  }

  getUserId() {
    const url = "https://api.twitch.tv/helix/users";
    const token: any = localStorage.getItem("twitch_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-Id": "ds3ban6ylu8w882wox7f1xyr9s7v56",
    });

    return this.http.get(url, { headers }).pipe(
      map((response: any) => {
        return response.data.length > 0 ? response.data[0].id : null;
      }),
    );
  }

  deleteChatMessage(broadcaster_id: string, moderator_id: string) {
    const url = `https://api.twitch.tv/helix/moderation/chat?broadcaster_id=${broadcaster_id}&moderator_id=${moderator_id}`
    const token: any = localStorage.getItem("twitch_token");


    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-Id": "ds3ban6ylu8w882wox7f1xyr9s7v56",
    });

    return this.http.delete(url, { headers });

  }

  timeoutUser() {
  }

  checkIfUserIsModerator(channel: string) {
    let isUserMod: boolean = false;
    const token: any = localStorage.getItem("twitch_token");
    const username: any = localStorage.getItem("username");
    if (channel === username) {
      return true;
    }
    this.getBroadCasterId(token, channel).subscribe((result) => {
      this.getModerators(result).subscribe((data: any) => {
        for (let i = 0; i < data.data.length; i++) {
          if (data.data[i].user_name === username) {
            isUserMod = true;
            break;
          } else {
            isUserMod = false;
            break;
          }
        }
      });
    });
    return isUserMod;
  }

  getModerators(broadcaster_id: string,) {
    const url = `https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${broadcaster_id}`;
    const token: any = localStorage.getItem("twitch_token");

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-Id": "ds3ban6ylu8w882wox7f1xyr9s7v56",
    });

    return this.http.get(url, { headers });
  }

  getChatSettings(broadcaster_id: string) {
    const token: any = localStorage.getItem("twitch_token");
    const url = "https://api.twitch.tv/helix/chat/settings?broadcaster_id=" + broadcaster_id;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-Id": "ds3ban6ylu8w882wox7f1xyr9s7v56",
    });

    return this.http.get(url, { headers });

  }

  getBroadCasterId(token: string, channel: string) {
    const url = "https://api.twitch.tv/helix/users?login=" + channel || "";
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-Id": "ds3ban6ylu8w882wox7f1xyr9s7v56",
    });
    return this.http.get(url, { headers }).pipe(
      map((response: any) => {
        return response.data.length > 0 ? response.data[0].id : null;
      }),
    );
  }

  checkAccessTokenValidity(token: string): Observable<boolean> {
    const url = "https://api.twitch.tv/helix/users";
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-Id": "ds3ban6ylu8w882wox7f1xyr9s7v56",
    });

    return this.http.get(url, { headers }).pipe(
      map((response) => true),
      catchError((error) => {
        if (error.status === 401) {
          return of(false);
        }
        return of(false);
      }),
    );
  }



  getUserCardInfo(name: string) {
    const url = `https://api.twitch.tv/helix/users?login=${name}`;
    const token: any = localStorage.getItem("twitch_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-Id": "ds3ban6ylu8w882wox7f1xyr9s7v56",
    });
    return this.http.get(url, { headers });
  }



  getUserInfo(): Observable<string> {
    const url = "https://api.twitch.tv/helix/users";

    return this.getAccessToken().pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          "Client-Id": "ds3ban6ylu8w882wox7f1xyr9s7v56",
        });
        return this.http.get<any>(url, { headers });
      }),
      map((response) => response.data),
    );
  }
}

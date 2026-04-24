import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of, from, BehaviorSubject } from "rxjs";
import { switchMap, map, catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  loginStatus: boolean = false;
  loginStatusSubject = new BehaviorSubject<boolean>(this.loginStatus);

  currentChannel: string = "";
  currentChannelSubject = new BehaviorSubject<string>(this.currentChannel);

  currentTheme: string = "";
  currentThemeSubject = new BehaviorSubject<string>(this.currentTheme);

  lastMessageUser: string = "";
  lastMessageUserSubject = new BehaviorSubject<string>(this.lastMessageUser);

  constructor(private http: HttpClient) {
    this.initLoginStatus();
  }

  async initLoginStatus() {
    try {
      let token = await this.getToken();
      if (token) {
        this.setLoginStatus(true);
      } else {
        this.setLoginStatus(false);
      }
    } catch (e) {
      this.setLoginStatus(false);
    }
  }

  getMaintainer() {
    const url = "https://api.github.com/users/Moritz344";
    return this.http.get(url);
  }

  setLoginStatus(isLogged: boolean) {
    this.loginStatus = isLogged;
    this.loginStatusSubject.next(this.loginStatus);
    localStorage.setItem("loginStatus", isLogged ? "true" : "false");
  }
  getLoginStatus() {
    return this.loginStatusSubject.asObservable();
  }

  setCurrentChannel(name: string) {
    this.currentChannel = name;
    this.currentChannelSubject.next(this.currentChannel);
  }

  getCurrentChannel() {
    return this.currentChannelSubject.asObservable();
  }

  setTheme(theme: string) {
    this.currentTheme = theme;
    this.currentThemeSubject.next(this.currentTheme);
    if (theme === "gnome-dark") {
      document.documentElement.setAttribute("data-theme", "gnome-dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  getTheme() {
    return this.currentThemeSubject.asObservable();
  }

  applyThemeFromStorage() {
    const settings: any = localStorage.getItem("settings");
    if (settings) {
      const settingsJson = JSON.parse(settings);
      this.setTheme(settingsJson[0]?.theme || "gnome-dark");
    }
  }

  async openExternalLink(url: string) {
    return await (window as any).electronAPI.openExternalLink(url);
  }

  async saveUserData(data: any) {
    return await (window as any).electronAPI.saveUserData(data);
  }

  async getVersion() {
    return await (window as any).electronAPI.getVersion();
  }

  async getToken() {
    return await (window as any).electronAPI.getToken();
  }

  async logout() {
    console.log("logout now");
    this.setLoginStatus(false);
    this.currentChannel = "";
    this.currentChannelSubject.next("");
    localStorage.removeItem("channel");
    localStorage.removeItem("user_id");
    localStorage.removeItem("global_badges");
    localStorage.removeItem("broadcaster_id");
    return await (window as any).electronAPI.logout();
  }

  async getStoredUsername() {
    return await (window as any).electronAPI.getUsername();
  }

  async getStoredCreatedAt() {
    return await (window as any).electronAPI.getCreatedAt();
  }

  async getStoredUserId() {
    return await (window as any).electronAPI.getUserId();
  }

  async getStoredDesc() {
    return await (window as any).electronAPI.getDesc();
  }

  async getStoredProfileImageUrl() {
    return await (window as any).electronAPI.getProfileImageUrl();
  }

  async openEmojiPicker() {
    return await (window as any).electronAPI.openEmojiPicker();
  }

  async openUserCard() {
    return await (window as any).electronAPI.openUserCard();
  }

  async exit() {
    return await (window as any).electronAPI.exit();
  }

  async copyTextToClipboard(text: string) {
    return await (window as any).electronAPI.copyTextToClipboard(text);
  }

  async openChatterList() {
    return await (window as any).electronAPI.openChatterList();
  }

  async openSettings() {
    return await (window as any).electronAPI.openSettings();
  }

  async startAuth() {
    return await (window as any).electronAPI.startAuth();
  }

  async closeWindow(window_name: string) {
    return await (window as any).electronAPI.closeWindow(window_name);
  }

  async onTwitchToken(callback: (token: string) => void) {
    return (window as any).electronAPI.onTwitchToken(callback);
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

  getUserId(token: string) {
    if (!token) {
      return of([]);
    }
    const url = "https://api.twitch.tv/helix/users";
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
    const url = `https://api.twitch.tv/helix/moderation/chat?broadcaster_id=${broadcaster_id}&moderator_id=${moderator_id}`;
    const token: any = localStorage.getItem("twitch_token");

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-Id": "ds3ban6ylu8w882wox7f1xyr9s7v56",
    });

    return this.http.delete(url, { headers });
  }

  timeoutUser() {}

  getModerators(broadcaster_id: string, token: string) {
    const url = `https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${broadcaster_id}`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-Id": "ds3ban6ylu8w882wox7f1xyr9s7v56",
    });

    return this.http.get(url, { headers });
  }

  getChatSettings(broadcaster_id: string, token: string) {
    if (!token) {
      console.log("token invalid");
      return of([]);
    }
    const url =
      "https://api.twitch.tv/helix/chat/settings?broadcaster_id=" +
      broadcaster_id;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-Id": "ds3ban6ylu8w882wox7f1xyr9s7v56",
    });

    return this.http.get(url, { headers });
  }

  getBroadCasterId(token: string, channel: string) {
    const url = "https://api.twitch.tv/helix/users?login=" + channel;
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
    if (!token) {
      return of(false);
    }
    const url = "https://api.twitch.tv/helix/users";
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-Id": "ds3ban6ylu8w882wox7f1xyr9s7v56",
    });

    return this.http.get(url, { headers }).pipe(
      map((response) => true),
      catchError((error) => {
        return of(false);
      }),
    );
  }

  getUserCardInfo(name: string, token: string) {
    const url = `https://api.twitch.tv/helix/users?login=${name}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-Id": "ds3ban6ylu8w882wox7f1xyr9s7v56",
    });
    return this.http.get(url, { headers });
  }

  getFollowedChannels(
    token: string,
    user_id: string,
    first: number,
    cursor: string,
    cursorType: string,
  ) {
    const params = new URLSearchParams();
    if (cursor) {
      params.append(cursorType, cursor);
    }

    const url =
      "https://api.twitch.tv/helix/channels/followed?user_id=" +
      user_id +
      "&" +
      params.toString();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Client-Id": "ds3ban6ylu8w882wox7f1xyr9s7v56",
    });

    return this.http.get(url, { headers });
  }

  getChannelInfo() {}

  getUserInfo(): Observable<any> {
    const url = "https://api.twitch.tv/helix/users";
    return from(this.getToken()).pipe(
      switchMap((token) => {
        console.log("token for user info:", token);
        if (!token) {
          return of(null);
        }
        console.log("user info", token);
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          "Client-Id": "ds3ban6ylu8w882wox7f1xyr9s7v56",
        });
        return this.http.get<any>(url, { headers });
      }),
    );
  }
}

import { Injectable } from '@angular/core';
import { TwitchChatService } from "../services/twitchChat.service";
import { Observable, Subject, of, throwError, BehaviorSubject } from "rxjs";

// TODO: when switching tab clear the chat

interface Tab {
  name: string,
}

@Injectable({
  providedIn: 'root'
})
export class TabService {
  private tabs: Tab[] = [{ name: "" }];
  private currentTabSubject = new BehaviorSubject<Tab>({ name: "" });
  currentTab$ = this.currentTabSubject.asObservable();
  private clearChatSubject = new Subject<void>();
  clearChat$ = this.clearChatSubject.asObservable();

  constructor(private chat: TwitchChatService) { }

  getTabs() {
    return this.tabs;
  }

  changeTab(tab: Tab) {
    this.chat.disconnect();
    this.clearChatSubject.next();
    const token: any = localStorage.getItem("twitch_token");
    const username: any = localStorage.getItem("username");
    this.chat.connect(token, username, tab.name);
    this.currentTabSubject.next(tab);
  }



  addTab(tab: Tab) {
    this.tabs.push(tab);
  }

  removeTab(index: number) {
    this.tabs.splice(index, 1);
  }



}

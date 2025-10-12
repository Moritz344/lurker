import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
 providedIn: 'root'
})


export class TabService implements OnDestroy {
  private socket?: WebSocket;
  private messageSubject = new Subject<string>();
  public messages$: Observable<string> = this.messageSubject.asObservable();

  connect(token: string, username: string, channel: string) {
    this.disconnect();

    this.socket = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

    this.socket.addEventListener('open', () => {
      console.log('Twitch Chat verbunden');
      console.log('oauth:',token);
      console.log('user:',username);
      console.log('channel:',channel);

      this.socket!.send(`PASS oauth:${token}`);
      this.socket!.send(`NICK ${username}`);
      this.socket!.send(`JOIN #${channel}`);
    });

    this.socket.addEventListener('message', (event) => {
      const raw = event.data as string;
      if (raw.startsWith('PING')) {
        this.socket!.send('PONG :tmi.twitch.tv');
        return;
      }

      const match = raw.match(/:(\w+)!.* PRIVMSG #\w+ :(.+)/);
      if (match) {
        const [, user, message] = match;
        this.messageSubject.next(`${user}: ${message}`);
      }
    });

    this.socket.addEventListener('close', () => {
      console.log('Twitch Chat getrennt');
    });
  }


  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
    }
  }

  ngOnDestroy() {
    this.disconnect();
  }
}


import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SettingsService{

  userAccessToken: string = "";
	userAccessTokenSubject = new BehaviorSubject<string>(this.userAccessToken);

	username: string = "";
	usernameSubject = new BehaviorSubject<string>(this.username);

	currentChannel: string = ""
	currentChannelSubject = new BehaviorSubject<string>(this.currentChannel);


  constructor(private http: HttpClient) { }


	setAccessToken(token: string) {
					this.userAccessToken = token;
					this.userAccessTokenSubject.next(this.userAccessToken);
					console.log("set user access token:",token);
	}

	getAccessToken() {
					return this.userAccessTokenSubject.asObservable();
	}

 setUserName(username: string) {
				 this.username = username;
				 this.usernameSubject.next(this.username);
 }

 setCurrentChannel(name: string) {
				 this.currentChannel = name;
				 this.currentChannelSubject.next(this.currentChannel);
 }

 getCurrentChannel() {
				 return this.currentChannelSubject.asObservable();
 }

 getUserName() {
				 return this.usernameSubject.asObservable();
 }

 getUserId(token: string) {
    const url = 'https://api.twitch.tv/helix/users';
    const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Client-Id': "ds3ban6ylu8w882wox7f1xyr9s7v56"
   });
	 return this.http.get(url, { headers });
 }

 getBroadCasterId(token: string,channel: string) {
				const url = 'https://api.twitch.tv/helix/users?login='
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Client-Id': "ds3ban6ylu8w882wox7f1xyr9s7v56"
        });
				return this.http.get(url + channel, { headers });
 }

 getUserInfo(): Observable<string> {
    const url = 'https://api.twitch.tv/helix/users';

    return this.getAccessToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Client-Id': "ds3ban6ylu8w882wox7f1xyr9s7v56"
        });
        return this.http.get<any>(url, { headers });
      }),
      map(response => response.data[0].display_name) 
    );
  }

}

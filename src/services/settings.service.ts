import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable,of,BehaviorSubject} from 'rxjs';
import { switchMap, map,catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SettingsService{

	loginStatus: boolean = false;
	loginStatusSubject = new BehaviorSubject<boolean>(this.loginStatus);

	currentChannel: string = ""
	currentChannelSubject = new BehaviorSubject<string>(this.currentChannel);


  constructor(private http: HttpClient) { }

	setLoginStatus(isLogged: boolean) {
					this.loginStatus = isLogged;
					this.loginStatusSubject.next(this.loginStatus);
	}
	getLoginStatus() {
					return this.loginStatusSubject.asObservable();;
	}


	setAccessToken(token: string) {
					localStorage.setItem('twitch_token',token);
	}

	getAccessToken() {
					return of(localStorage.getItem('twitch_token'));
	}

 setUserName(username: string) {
				 localStorage.setItem('username',username);
 }
 getUserName() {
				 return of (localStorage.getItem('username'));
 }

 setCurrentChannel(name: string) {
				 this.currentChannel = name;
				 this.currentChannelSubject.next(this.currentChannel);
 }

 getCurrentChannel() {
				 return this.currentChannelSubject.asObservable();
 }


 getUserId(token: string) {
    const url = 'https://api.twitch.tv/helix/users';
    const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Client-Id': "ds3ban6ylu8w882wox7f1xyr9s7v56"
   });
	 return this.http.get(url, { headers }).pipe(
        map((response: any) => {
            return response.data.length > 0 ? response.data[0].id : null;
        })
    );
 }

 getBroadCasterId(token: string,channel: string) {
				const url = 'https://api.twitch.tv/helix/users?login='
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Client-Id': "ds3ban6ylu8w882wox7f1xyr9s7v56"
        });
				return this.http.get(url + channel, { headers }).pipe(
								map((response: any) => {
												console.log(response);
        				    return response.data.length > 0 ? response.data[0].id : null;
        				})
    );

 }

 checkAccessTokenValidity(token: string): Observable<boolean> {
    const url = 'https://api.twitch.tv/helix/users';
    const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Client-Id': 'ds3ban6ylu8w882wox7f1xyr9s7v56'
    });

    return this.http.get(url, { headers }).pipe(
        map(response => true),
        catchError(error => {
            if (error.status === 401) {
                return of(false);
            }
            return of(false);
        })
    );
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

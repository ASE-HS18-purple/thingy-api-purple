import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthModel} from '../model/auth.model';

@Injectable()
export class Authenticate {

  url = 'http://localhost:3000/authenticate';

  constructor(public http: HttpClient) {
  }

  public authenticate(usernameOrEmail: string, password: string) {
    return this.http.post(this.url, {
      usernameOrEmail: usernameOrEmail,
      password: password,
    });
  }

  public isLoggedIn() {
    const user = localStorage.getItem('currentUser');
    return user && user.length > 0;
  }

  public logOut() {
    return localStorage.removeItem('currentUser');
  }

  public storeTokenAndUser(authModel: AuthModel) {
    localStorage.setItem('currentUser', JSON.stringify(authModel));
  }
}

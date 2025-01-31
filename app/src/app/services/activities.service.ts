import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { AppService } from "./app.service";

import { Activity } from "../models/activity";

import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root"
})
export class ActivitiesService {
  constructor(private http: HttpClient,
              private appService: AppService,
  ) {
  }

  private apiUrl = `${environment.apiUrl}/api`;

  public getActivities(): Observable<Activity[]> {
    const url: string = `${this.apiUrl}/activities`;
    const httpProperties = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.appService.getToken()}`
      })
    };

    return this.http.get(url, httpProperties) as Observable<Activity[]>;
  }

  public getActivitiesByTag(tag: string): Observable<Activity[]> {
    const url: string = `${this.apiUrl}/activities?tag=${tag}`;
    const httpProperties = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.appService.getToken()}`
      })
    };

    return this.http.get(url, httpProperties) as Observable<Activity[]>;
  }

  public getActivity(activityId: string): Observable<Activity> {
    const url: string = `${this.apiUrl}/activities/${activityId}`;
    const httpProperties = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.appService.getToken()}`
      })
    };

    return this.http.get(url, httpProperties) as Observable<Activity>;
  }

  public createActivity(activityData: any): Observable<Activity> {
    const url: string = `${this.apiUrl}/activities`;
    const httpProperties = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.appService.getToken()}`
      })
    };

    return this.http.post(url, activityData, httpProperties) as Observable<Activity>;
  }

  public updateActivity(activityId: string, activityData: any): Observable<Activity> {
    const url: string = `${this.apiUrl}/activities/${activityId}`;
    const httpProperties = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.appService.getToken()}`
      })
    };

    return this.http.put(url, activityData, httpProperties) as Observable<Activity>;
  }

  public deleteActivity(activityId: string): Observable<null> {
    const url: string = `${this.apiUrl}/activities/${activityId}`;
    const httpProperties = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.appService.getToken()}`
      })
    };

    return this.http.delete(url, httpProperties) as Observable<null>;
  }

  public analyzeInvoice(base64: any): Observable<any> {
    const url: string = `${this.apiUrl}/ai/analyze-receipt`;
    const httpProperties = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.appService.getToken()}`
      })
    };

    return this.http.post(url, base64, httpProperties) as Observable<null>;
  }
}

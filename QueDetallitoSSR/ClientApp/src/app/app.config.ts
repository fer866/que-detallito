import { DOCUMENT } from "@angular/common";
import { InjectionToken } from "@angular/core";

export const BASE_URL = new InjectionToken<string>('BaseUrl');

export function GetBaseUrl(): string {
    return document.getElementsByTagName('base')[0].href;
}
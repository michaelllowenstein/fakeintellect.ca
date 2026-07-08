import { Injectable } from '@angular/core';
import { environment } from '../../../envs/env';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  readonly apiBaseUrl = environment.apiUrl;
  readonly firebaseConfig = environment.firebase;
}

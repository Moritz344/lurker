import { TestBed } from '@angular/core/testing';
import { TwitchChatService } from './twitchChat.service';

describe('RequestsService', () => {
  let service: TwitchChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TwitchChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

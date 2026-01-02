export class authResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
    username: string;
    preferredLanguage: string;
  };
}

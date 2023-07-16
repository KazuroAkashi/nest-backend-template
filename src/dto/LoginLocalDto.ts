export class LoginDto {
    /**
     * @minLength 5
     * @maxLength 16
     */
    tag!: string;

    password!: string;
}

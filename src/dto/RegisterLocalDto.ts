export class RegisterDto {
    /**
     * @minLength 5
     * @maxLength 16
     */
    tag!: string;

    /**
     * @format email
     */
    email!: string;

    password!: string;
}

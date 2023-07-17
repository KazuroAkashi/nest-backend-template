export const WEBSOCKET_ERRORS = {
    MALFORMED_CONNECTION_REQUEST: 400,
    INVALID_TOKEN: 401,
};

export const ERRORS = {
    TAG_MUST_BE_UNIQUE: 400,
    EMAIL_MUST_BE_UNIQUE: 401,
    TAG_OR_PASSWORD_INVALID: 500,
    ROLE_NAMES_MUST_BE_UNIQUE: 600,
    CANNOT_DELETE_ROLE_WITH_USERS: 601,
};

export const JWT_SECRET_OBJ = {
    secret: process.env.JWT_SECRET || "123",
};

export enum Events {
    NewMessage = "NewMessage",
    DeleteMessage = "DeleteMessage",
}

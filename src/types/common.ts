// Language enum based on backend-filesystem MCP server
export enum Language {
    EN = 'en',
    UZ = 'uz'
}

export interface PageableList<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    page: number;
}
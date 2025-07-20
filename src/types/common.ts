// Language enum based on backend-filesystem MCP server
export enum Language {
    EN = 'en',
    UZ = 'uz'
}

// User state enum based on backend-filesystem MCP server
export enum UserState {
    NEW = 'new',
    ACTIVE = 'active',
    BLOCKED = 'blocked',
    DELETED = 'deleted'
}

// Quiz status enum based on backend-filesystem MCP server
export enum QuizStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived'
}

// Assignment status enum based on backend-filesystem MCP server
export enum AssignmentStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived'
}

// Common pagination and sorting types
export interface SortDto {
    field: string;
    direction: 'ASC' | 'DESC';
}

export interface PageableList<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
    empty: boolean;
}
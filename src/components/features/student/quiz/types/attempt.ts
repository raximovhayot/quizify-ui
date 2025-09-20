export enum AttemptStatus {
    CREATED,
    STARTED,
    FINISHED
}

export interface AttemptListingData {
    id: number;
    title: string;
    attempt: number; // which attempt is this
    status: AttemptStatus;
    correct: number;
    incorrect: number;
    notChosen: number;
    total: number;
}
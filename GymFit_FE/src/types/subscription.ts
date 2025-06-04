export interface Subscription {
    Id: number;
    UserId: number;
    User?: {
        Id: number;
        Name: string;
        Email: string;
        PhoneNumber: string;
        DateOfBirth: string;
        UserRole: number;
    };
    Type: string;
    Price: number;
    StartDate: string;
    EndDate: string;
}
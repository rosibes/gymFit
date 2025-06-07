export enum SubscriptionType {
    Fitness = 0,
    Pilates = 1,
    Yoga = 2,
    CrossFit = 3,
    Swimming = 4,
    PersonalTraining = 5,
    Cardio = 7
}

export interface Subscription {
    Id?: number;
    UserId: number;
    User?: {
        Id: number;
        Name: string;
        Email: string;
        PhoneNumber: string;
        DateOfBirth: string;
        UserRole: number;
    };
    Type: SubscriptionType;
    Price: number;
    StartDate: string;
    EndDate: string;
    IsActive: boolean;
}
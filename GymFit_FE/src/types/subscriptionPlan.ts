export interface SubscriptionPlan {
    Id: number;
    Name: string;
    Description: string;
    Price: number;
    DurationInDays: number;
    Type: string;
}

export enum SubscriptionType {
    Fitness = 0,
    Pilates = 1,
    Yoga = 2,
    CrossFit = 3,
    Swimming = 4,
    PersonalTraining = 5,
    Cardio = 7
} 
export interface Trainer {
    Id: number;
    UserId: number;
    User: {
        Id: number;
        Name: string;
        Email: string;
        PhoneNumber: string;
        DateOfBirth: string;
        UserRole: number;
    };
    Specialization: string;
    Experience: string;
    Introduction: string;
    Availability: string;
    Location: string;
} 
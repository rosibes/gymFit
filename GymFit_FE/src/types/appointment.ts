export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';

export interface Appointment {
    Id?: number;
    UserId: number,
    User?: {
        Id: number;
        Name: string;
        Email: string;
        PhoneNumber: string;
        DateOfBirth: string;
        UserRole: number;
    };
    TrainerId: number,
    Trainer?: {
        Id: number;
        UserId: number;
        Specialization: string;
        Experience: string;
        Introduction: string;
        Availability: string;
        Location: string;
        User?: {
            Id: number;
            FirstName: string;
            LastName: string;
            Email: string;
            PhoneNumber: string;
            DateOfBirth: string;
            UserRole: number;
        };
    };
    Date: string,
    Status: AppointmentStatus;
}
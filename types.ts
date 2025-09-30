
export enum AppStates {
    AWAITING_UPLOAD = 'AWAITING_UPLOAD',
    ANALYZING = 'ANALYZING',
    DISPLAYING_DATA = 'DISPLAYING_DATA',
    DONE = 'DONE',
    FREE_CHAT = 'FREE_CHAT',
}
export type AppState = AppStates;

export interface Payment {
    description: string;
    amount: number;
}

export interface Deduction {
    description: string;
    amount: number;
}

export interface PayslipData {
    employeeName: string;
    employeeId: string;
    employerName: string;
    payPeriod: string;
    grossSalary: number;
    netSalary: number;
    totalDeductions: number;
    payments: Payment[];
    deductions: Deduction[];
}

export interface ChatMessage {
    sender: 'user' | 'bot';
    text: string;
    options?: string[];
}

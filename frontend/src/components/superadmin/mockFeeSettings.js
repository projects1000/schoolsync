// Mock data for Global Fee & Financial Master Settings

export const feeCategories = [
    {
        id: 'tuition',
        name: 'Tuition Fee',
        code: 'TUI',
        description: 'Monthly academic tuition fees',
        frequency: 'Monthly',
        taxable: false,
        mandatory: true,
        defaultAmount: null,
        icon: '📚'
    },
    {
        id: 'admission',
        name: 'Admission Fee',
        code: 'ADM',
        description: 'One-time admission and registration charges',
        frequency: 'One-time',
        taxable: false,
        mandatory: true,
        defaultAmount: null,
        icon: '🎓'
    },
    {
        id: 'transport',
        name: 'Transport Fee',
        code: 'TRN',
        description: 'School bus/van transport charges',
        frequency: 'Monthly',
        taxable: false,
        mandatory: false,
        defaultAmount: null,
        icon: '🚌'
    },
    {
        id: 'activity',
        name: 'Activity Fee',
        code: 'ACT',
        description: 'Extra-curricular activities and events',
        frequency: 'Quarterly',
        taxable: false,
        mandatory: false,
        defaultAmount: null,
        icon: '🎨'
    }
];

export const lateFeeRules = [
    {
        id: 1,
        name: 'Grace Period',
        condition: 'Days after due date',
        value: 7,
        unit: 'days',
        action: 'No penalty',
        description: '7 days grace period after due date'
    },
    {
        id: 2,
        name: 'Flat Late Fee',
        condition: 'After grace period',
        value: 100,
        unit: '₹',
        action: 'Add flat fee',
        description: '₹100 flat late fee after grace period'
    },
    {
        id: 3,
        name: 'Daily Penalty',
        condition: 'Per day after 15 days',
        value: 10,
        unit: '₹/day',
        action: 'Add daily fee',
        description: '₹10 per day after 15 days of due date'
    },
    {
        id: 4,
        name: 'Maximum Cap',
        condition: 'Maximum late fee',
        value: 500,
        unit: '₹',
        action: 'Cap at amount',
        description: 'Late fee capped at ₹500 maximum'
    }
];

export const discountRules = [
    {
        id: 1,
        name: 'Sibling Discount',
        type: 'Percentage',
        value: 10,
        applicableTo: ['Tuition Fee'],
        condition: 'Second child onwards',
        autoApply: true,
        description: '10% discount on tuition for siblings'
    },
    {
        id: 2,
        name: 'Early Bird Discount',
        type: 'Percentage',
        value: 5,
        applicableTo: ['Admission Fee'],
        condition: 'Paid before admission deadline',
        autoApply: true,
        description: '5% off admission if paid early'
    },
    {
        id: 3,
        name: 'Annual Payment Discount',
        type: 'Percentage',
        value: 8,
        applicableTo: ['Tuition Fee', 'Transport Fee'],
        condition: 'Full year paid upfront',
        autoApply: false,
        description: '8% discount for annual payment'
    },
    {
        id: 4,
        name: 'Staff Child Discount',
        type: 'Percentage',
        value: 50,
        applicableTo: ['Tuition Fee', 'Activity Fee'],
        condition: 'Child of school staff',
        autoApply: false,
        description: '50% off for staff children'
    }
];

export const refundRules = [
    {
        id: 1,
        name: 'Admission Fee Refund',
        category: 'Admission Fee',
        condition: 'Before session starts',
        refundPercent: 100,
        deduction: 'Processing fee ₹500',
        description: 'Full refund minus processing fee if withdrawn before session'
    },
    {
        id: 2,
        name: 'Tuition Refund - First Month',
        category: 'Tuition Fee',
        condition: 'Within first month',
        refundPercent: 75,
        deduction: '25% retention',
        description: '75% refund if withdrawn in first month'
    },
    {
        id: 3,
        name: 'Tuition Refund - After Month',
        category: 'Tuition Fee',
        condition: 'After first month',
        refundPercent: 0,
        deduction: 'No refund',
        description: 'No refund for tuition after first month'
    },
    {
        id: 4,
        name: 'Transport Refund',
        category: 'Transport Fee',
        condition: 'Mid-month withdrawal',
        refundPercent: 50,
        deduction: 'Pro-rated',
        description: 'Pro-rated refund for unused transport days'
    },
    {
        id: 5,
        name: 'Activity Fee Refund',
        category: 'Activity Fee',
        condition: 'Before activity starts',
        refundPercent: 100,
        deduction: 'None',
        description: 'Full refund if activity not started'
    }
];

export const invoiceTemplate = {
    headerLogo: true,
    showSchoolAddress: true,
    showGSTNumber: false,
    invoicePrefix: 'INV',
    invoiceNumberFormat: 'INV-YYYY-NNNN',
    showStudentPhoto: false,
    showParentDetails: true,
    showDueDate: true,
    showLateFeeWarning: true,
    footerText: 'Thank you for choosing our school. For queries, contact the admin office.',
    paymentMethods: ['Cash', 'UPI', 'Bank Transfer', 'Cheque'],
    termsAndConditions: [
        'Fees once paid are non-refundable unless mentioned otherwise.',
        'Late payment will attract penalty as per school policy.',
        'Please retain this invoice for your records.'
    ]
};

export const feeSettingsVersion = {
    current: 'v1.4',
    lastUpdated: '2026-01-10T14:30:00',
    history: [
        { version: 'v1.4', date: '2026-01-10', changes: ['Added maximum cap to late fees', 'Updated refund policy'] },
        { version: 'v1.3', date: '2025-11-15', changes: ['Added staff child discount rule'] },
        { version: 'v1.2', date: '2025-08-01', changes: ['Modified sibling discount from 15% to 10%'] },
        { version: 'v1.1', date: '2025-04-01', changes: ['Added activity fee category'] },
        { version: 'v1.0', date: '2024-04-01', changes: ['Initial fee structure'] }
    ]
};

export type ResponseOption = 'Yes' | 'Partial' | 'No' | 'Unknown' | 'Not Applicable';

export interface Control {
    id: string;
    title: string;
    requirement: string;
}

export interface ControlResponse {
    response?: ResponseOption;
    notes: string;
}

export const RESPONSE_OPTIONS: ResponseOption[] = [
    'Yes',
    'Partial',
    'No',
    'Unknown',
    'Not Applicable'
];

export const SAMPLE_CONTROLS: Control[] = [
    {
        id: '3.1.1',
        title: 'Access Control Policy',
        requirement: 'Organization has defined and documented an access control policy that addresses purpose, scope, roles, responsibilities, and compliance.'
    },
    {
        id: '3.1.2',
        title: 'Account Management',
        requirement: 'Organization manages information system accounts including creation, enabling, modification, review, and removal of accounts.'
    },
    {
        id: '3.1.3',
        title: 'Access Enforcement',
        requirement: 'Organization enforces approved authorizations for logical access to information and system resources.'
    },
    {
        id: '3.1.4',
        title: 'Separation of Duties',
        requirement: 'Organization separates duties of individuals to reduce the risk of malevolent activity without collusion.'
    },
    {
        id: '3.1.5',
        title: 'Least Privilege',
        requirement: 'Organization employs the principle of least privilege, allowing only authorized access necessary to accomplish assigned tasks.'
    },
    {
        id: '3.2.1',
        title: 'Awareness and Training Policy',
        requirement: 'Organization has established and maintains awareness and training policy and procedures.'
    },
    {
        id: '3.2.2',
        title: 'Security Awareness Training',
        requirement: 'Organization provides security awareness training to system users before authorizing access and at least annually thereafter.'
    },
    {
        id: '3.3.1',
        title: 'Audit and Accountability Policy',
        requirement: 'Organization has defined and documented an audit and accountability policy.'
    },
    {
        id: '3.3.2',
        title: 'Audit Events',
        requirement: 'Organization determines the system is capable of auditing specified events and coordinates security audit function with other entities.'
    },
    {
        id: '3.4.1',
        title: 'Configuration Management Policy',
        requirement: 'Organization establishes and maintains baseline configurations and inventories of organizational systems.'
    }
];

import {
  DOCALERT_WEBSITE_URL,
  PRIVACY_POLICY_URL,
  SUPPORT_EMAIL_DISPLAY,
  SUPPORT_EMAIL_URL,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_URL,
  SUPPORT_WHATSAPP_URL,
} from '@/src/lib/supportContacts';

export const PRIVACY_POLICY_EFFECTIVE_DATE = '18 October 2026';

export type PrivacyLink = {
  label: string;
  url: string;
  unavailableMessage: string;
};

export type PrivacySection = {
  title: string;
  paragraphs: string[];
};

export const privacyPolicyIntroLinks: PrivacyLink[] = [
  {
    label: DOCALERT_WEBSITE_URL,
    url: DOCALERT_WEBSITE_URL,
    unavailableMessage: 'No browser is available to open the DocAlert website.',
  },
  {
    label: SUPPORT_EMAIL_DISPLAY,
    url: SUPPORT_EMAIL_URL,
    unavailableMessage: 'No email app is available on this device.',
  },
];

export const privacyPolicyWebLink: PrivacyLink = {
  label: PRIVACY_POLICY_URL,
  url: PRIVACY_POLICY_URL,
  unavailableMessage: 'No browser is available to open the privacy policy page.',
};

export const privacyPolicySections: PrivacySection[] = [
  {
    title: '1. Introduction',
    paragraphs: [
      'DocAlert is a business document management and expiry notification platform provided by Technaas Solutions.',
      'DocAlert helps organizations manage employee records, company documents, vehicle documents, expiry dates, and related administrative information.',
      'This Privacy Policy explains how personal and business information is collected, used, stored, shared, and protected when authorized users access DocAlert through its mobile application or web platform.',
    ],
  },
  {
    title: '2. Information We Process',
    paragraphs: [
      'Depending on the features used by an organization, DocAlert may process:',
      'Account information: Names, email addresses, phone numbers, company associations, login identifiers, and assigned roles.',
      'Employee information: Employee names, contact information, employment details, salary-related information, and other records maintained by the organization.',
      'Identity and employment documents: Passport information, residency or visa documents, civil identification records, work-related permits, and their expiry dates.',
      'Business information: Company, brand, branch, and other organizational records.',
      'Vehicle and asset information: Vehicle registration details, insurance documents, and associated expiry dates.',
      'Uploaded documents: Files, images, and other records submitted by authorized users.',
      'Technical information: Device identifiers, application version, authentication activity, notification registration tokens, and information needed for security and troubleshooting.',
      "The information processed depends on the organization's configuration and the access permissions assigned to each user.",
    ],
  },
  {
    title: '3. How Information Is Used',
    paragraphs: [
      'DocAlert processes information to:',
      'Provide document management and recordkeeping functionality.',
      'Monitor document expiry dates and generate reminders.',
      'Deliver notifications through supported channels, including in-app or mobile push notifications, email, and WhatsApp where configured.',
      'Authenticate users and enforce role-based permissions.',
      'Support authorized administrative and operational workflows.',
      'Maintain service security, investigate technical issues, and provide customer support.',
      'Meet applicable legal obligations.',
      'DocAlert is not intended to use customer-uploaded employee documents for unrelated advertising.',
    ],
  },
  {
    title: '4. Organization and User Responsibilities',
    paragraphs: [
      'Organizations using DocAlert are responsible for determining which employee and business information they upload and which authorized users may access it.',
      'Technaas Solutions operates the platform and processes information to provide the subscribed services, subject to the applicable customer agreement and legal requirements.',
      'Organizations are responsible for ensuring they have an appropriate legal basis for collecting and managing personal information relating to their employees and other individuals.',
    ],
  },
  {
    title: '5. Data Storage and Security',
    paragraphs: [
      'DocAlert uses hosted infrastructure and database services to operate the platform.',
      'Security measures may include authenticated access, role-based permissions, protected network communications, and controlled document access.',
      'No electronic system can guarantee absolute security. Users and organizations should protect their login credentials and notify the support team if they suspect unauthorized access.',
    ],
  },
  {
    title: '6. Third-Party Service Providers',
    paragraphs: [
      'DocAlert uses external technology providers for functions such as application hosting, database storage, email delivery, and mobile push notifications.',
      "Depending on the organization's configuration, notifications may also be delivered using WhatsApp-related services.",
      'These providers may process the information necessary to deliver their respective services. Their handling of information is also governed by their applicable terms and privacy policies.',
    ],
  },
  {
    title: '7. Notifications',
    paragraphs: [
      'DocAlert may send reminders concerning upcoming document expirations, expired documents, administrative events, and other operational matters.',
      'Mobile push notifications require device registration and the necessary notification permissions.',
      "Users can manage mobile notification permissions through their device settings. Disabling push notifications does not necessarily disable email or WhatsApp reminders configured by their organization.",
    ],
  },
  {
    title: '8. Data Access and Sharing',
    paragraphs: [
      'Access to organization information is controlled through user accounts and assigned permissions.',
      'Information may be disclosed to authorized organization users, service providers supporting DocAlert, or parties to whom disclosure is legally required.',
      'Customer-uploaded information is not intended to be made publicly accessible through the application.',
    ],
  },
  {
    title: '9. Data Retention and Deletion',
    paragraphs: [
      'Information is retained as necessary to provide DocAlert services, support legitimate business operations, and meet applicable legal or contractual obligations.',
      'Organizations may request correction, export, or deletion of their information, subject to applicable agreements, technical limitations, and legal retention requirements.',
      "Users seeking access to or correction of employee records should generally contact their organization's authorized administrator first.",
    ],
  },
  {
    title: '10. International Data Processing',
    paragraphs: [
      "Because DocAlert uses hosted technology services, information may be processed or stored in locations outside the user's country.",
      'Where applicable, information will be handled in accordance with relevant contractual requirements and data protection obligations.',
    ],
  },
  {
    title: "11. Children's Privacy",
    paragraphs: [
      'DocAlert is intended for business and administrative use, not for independent use by children.',
      "The application is not designed to collect children's personal information for consumer-facing services.",
    ],
  },
  {
    title: '12. Changes to This Policy',
    paragraphs: [
      'Technaas Solutions may update this Privacy Policy to reflect changes in DocAlert services, technology, legal requirements, or data processing practices.',
      'The revised policy will display its updated effective date.',
    ],
  },
];

export const privacyPolicyContacts: PrivacyLink[] = [
  {
    label: `Email: ${SUPPORT_EMAIL_DISPLAY}`,
    url: SUPPORT_EMAIL_URL,
    unavailableMessage: 'No email app is available on this device.',
  },
  {
    label: `Phone: ${SUPPORT_PHONE_DISPLAY}`,
    url: SUPPORT_PHONE_URL,
    unavailableMessage: 'No phone app is available on this device.',
  },
  {
    label: `WhatsApp: ${SUPPORT_PHONE_DISPLAY}`,
    url: SUPPORT_WHATSAPP_URL,
    unavailableMessage: 'WhatsApp could not be opened on this device.',
  },
  {
    label: `Website: ${DOCALERT_WEBSITE_URL}`,
    url: DOCALERT_WEBSITE_URL,
    unavailableMessage: 'No browser is available to open the DocAlert website.',
  },
];

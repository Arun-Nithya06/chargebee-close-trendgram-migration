export interface CloseCrmLead {
  organization_id: string;
  date_updated: string;
  name: string;
  updated_by_name: string;
  integration_links: IntegrationLink[];
  html_url: string;
  tasks: any[];
  created_by: string;
  status_id: string;
  created_by_name: string;
  status_label: string;
  opportunities: any[];
  contacts: Contact[];
  id: string;
  addresses: any[];
  description: string;
  display_name: string;
  updated_by: string;
  custom: Custom;
  date_created: string;
  url: string;
  //   "custom.cf_xdpRSEOyXh6rNI2kkidowb58demTj5AvPWgPDgAPDNl": string; // custom field
}

export interface IntegrationLink {
  name: string;
  url: string;
}

export interface Contact {
  id: string;
  organization_id: string;
  lead_id: string;
  created_by: string;
  updated_by: string;
  date_created: string;
  date_updated: string;
  name: string;
  title: string;
  display_name: string;
  integration_links: IntegrationLink2[];
  urls: any[];
  emails: Email[];
  phones: Phone[];
}

export interface IntegrationLink2 {
  name: string;
  url: string;
}

export interface Email {
  type: string;
  email: string;
  is_unsubscribed: boolean;
}

export interface Phone {
  type: string;
  phone: string;
  phone_formatted: string;
  country: any;
}

export interface Custom {
  [key: string]: any;
}

export interface CreadLead {
  name?: string;
  url?: string;
  description?: string;
  status_id?: string;
  contacts?: Contact[];
  custom?: Custom;
  addresses?: Address[];
}

export interface Address {
  label?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
}

export interface ExportCustomer {
  "Customer Id": string;
  Email: string;
  "First Name"?: string;
  "Auto Collection": string;
  "Card Status"?: string;
  "Created At": string;
  sub_ins_id?: string;
  "Customer Portal Status": string;
  "Net Term Days": string;
  Taxability: string;
  utm_content?: string;
  utm_campaign?: string;
  utm_medium?: string;
  utm_source?: string;
  utm_term?: string;
  "Last Name"?: string;
  gclid?: string;
  "Offline payment method"?: string;
  "Billing Address Country"?: string;
  "Billing Address First Name"?: string;
  "Billing Address Last Name"?: string;
  "Billing Address Validation Status"?: string;
  Company?: string;
  "Billing Address Line1"?: string;
  "Billing Address Line2"?: string;
  "Billing Address City"?: string;
  "Billing Address State"?: string;
  "Billing Address Zip"?: string;
  "Billing Address Company"?: string;
  "Billing Address Phone"?: string;
  Phone?: string;
  "Billing Address State Code"?: string;
  Locale?: string;
  "Billing Address Email"?: string;
  "Billing Address Line3"?: string;
}
export interface CloseCustomerInfo {
  created_by: string;
  "custom.cf_DQmeqGEN2SBrXfUJPQynxH8RrUis9IEibGP2r9qyq8v": string;
  "custom.cf_KCVtu8BIydFLdhxxHvaDpslJdWbc7h5Ka50NwZEBHu2": string;
  "custom.cf_N5ZVTTCE3h3rZkOb6bVGN8rsTZLOne4bLKo5vabVJcY": string;
  "custom.cf_R6PqQ7PnR5i66mwmaqPj52Uf3wDjTPbBttmKOAifzxL": string;
  "custom.cf_RrzccNjfxlXAxjBFwEXd9b23KgZnDoBCQmBX7c1ADHL": string;
  "custom.cf_SeVsb0cqzDDEXiXMVvQHh4NhWzB4RPwQpkydFiAsbSd": string;
  "custom.cf_VyYF7nxIZwOY9wZhA2FTlTlFWd94hAx7cm6icIUxwJj": string;
  "custom.cf_lT7TttCFn8uMa7Ms6ap1OZU3MAzfVGKZHX6HTV6jcO1": string;
  "custom.cf_oT0r6S5vQgX4z1OARsMMHRJqFcyIFupF3MHxgGXW80c": string;
  "custom.cf_rgQvezfnL8YNbOtIgyJIiIb8YgiZ32art0w85PuQF8J": string;
  "custom.cf_rtWQB5hrD28wSvqWW0Wb8q2MCbktlw78iBZLjhWHbSj": string;
  date_created: string;
  date_updated: string;
  display_name: string;
  emails: Email[];
  id: string;
  integration_links: IntegrationLink[];
  lead_id: string;
  name: string;
  organization_id: string;
  phones: any[];
  title: any;
  updated_by: string;
  urls: any[];
}

export interface Email {
  email: string;
  is_unsubscribed: boolean;
  type: string;
}

export interface IntegrationLink {
  name: string;
  url: string;
}

export interface ChargebeeCusomerMetaInfo {
  customer: ChargebeeCustomer;
  card: Card;
}

export interface ChargebeeCustomer {
  id: string;
  first_name: string;
  email: string;
  auto_collection: string;
  net_term_days: number;
  allow_direct_debit: boolean;
  created_at: number;
  taxability: string;
  updated_at: number;
  pii_cleared: string;
  channel: string;
  resource_version: number;
  deleted: boolean;
  object: string;
  card_status: string;
  promotional_credits: number;
  refundable_credits: number;
  excess_payments: number;
  unbilled_charges: number;
  preferred_currency_code: string;
  mrr: number;
  primary_payment_source_id: string;
  payment_method: PaymentMethod;
  cf_sub_ins_id: string;
}

export interface PaymentMethod {
  object: string;
  type: string;
  reference_id: string;
  gateway: string;
  gateway_account_id: string;
  status: string;
}

export interface Card {
  status: string;
  gateway: string;
  gateway_account_id: string;
  iin: string;
  last4: string;
  card_type: string;
  funding_type: string;
  expiry_month: number;
  expiry_year: number;
  issuing_country: string;
  created_at: number;
  updated_at: number;
  ip_address: string;
  powered_by: string;
  resource_version: number;
  object: string;
  masked_number: string;
  customer_id: string;
  payment_source_id: string;
}

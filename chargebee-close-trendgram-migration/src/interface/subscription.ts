export interface ChargebeeSubscriptionMetaData {
  list: List[];
}

export interface List {
  subscription: ChargebeeSubscription;
  customer: Customer;
  card: Card;
}

export interface ChargebeeSubscription {
  id: string;
  billing_period: number;
  billing_period_unit: string;
  trial_end: number;
  po_number: string;
  auto_collection: string;
  customer_id: string;
  status: string;
  trial_start: number;
  next_billing_at: number;
  created_at: number;
  started_at: number;
  updated_at: number;
  has_scheduled_changes: boolean;
  channel: string;
  resource_version: number;
  deleted: boolean;
  object: string;
  currency_code: string;
  subscription_items: SubscriptionItem[];
  due_invoices_count: number;
  has_scheduled_advance_invoices: boolean;
}

export interface SubscriptionItem {
  item_price_id: string;
  item_type: string;
  quantity: number;
  unit_price: number;
  amount: number;
  free_quantity: number;
  trial_end: number;
  object: string;
}

export interface Customer {
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

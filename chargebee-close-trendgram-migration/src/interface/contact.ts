export interface CreateContact {
  lead_id?: string;
  name?: string;
  title?: string;
  phones?: Phone[];
  emails?: Email[];
  urls?: Url[];
  custom?: {};
  id?: string;
}

export interface Url {
  url?: string;
  type?: string;
}

export interface Phone {
  type?: string;
  phone?: string;
}
export interface Email {
  email?: string;
  type?: string;
}

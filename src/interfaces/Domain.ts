export interface Domain {
  domain: string;
  available: boolean;
  registered_at?: Date;
  price?: string;
  provider?: 'namecheap';
  whois?: boolean;
}

export interface DomainCheck {
  domain: string;
}

export interface DomainPurchase {
  domain: string;
  provider: string;
}

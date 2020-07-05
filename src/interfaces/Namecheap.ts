export interface NamecheapAPIResponse {
  ApiResponse: APIResponse;
}

export interface APIResponse {
  $: APIResponseClass;
  Errors: string[];
  Warnings: string[];
  RequestedCommand: string[];
  CommandResponse: CommandResponseElement[];
  Server: string[];
  GMTTimeDifference: string[];
  ExecutionTime: string[];
}

export interface APIResponseClass {
  Status: string;
  xmlns: string;
}

export interface CommandResponseElement {
  $: CommandResponse;
  DomainCheckResult: DomainCheckResult[];
}

export interface CommandResponse {
  Type: string;
}

export interface DomainCheckResult {
  $: { [key: string]: string };
}

export interface NamecheapDomain {
  Domain: string;
  Available: string;
  ErrorNo: string;
  Description: string;
  IsPremiumName: string;
  PremiumRegistrationPrice: string;
  PremiumRenewalPrice: string;
  PremiumRestorePrice: string;
  PremiumTransferPrice: string;
  IcannFee: string;
  EapFee: string;
}

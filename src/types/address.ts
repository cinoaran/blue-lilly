export type AddressPayload = {
  firstName: string;
  lastName: string;
  company?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  postalCode: string;
  city: string;
  country: string;
  phone?: string | null;
  email?: string | null;
};

export type BundledPackage = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  is_popular: boolean;
  badge_text: string | null;
  active: boolean;
};

export type NewBundledPackage = Omit<BundledPackage, 'id' | 'active'> & {
  active?: boolean;
};
